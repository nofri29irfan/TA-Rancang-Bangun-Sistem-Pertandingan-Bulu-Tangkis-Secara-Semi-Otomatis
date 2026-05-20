import db from '../db.js';

export const createMatch = async (req, res) => {
    const client = await db.connect();

    try {
        const organizerId = 1;
        const { match_category, match_date, players } = req.body;

        const dbCategory = match_category === 'Ganda' ? 'doubles' : 'singles';

        await client.query('BEGIN');

        const tournamentRes = await client.query(
            `SELECT id FROM tournaments WHERE organizer_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [organizerId]
        );

        if (tournamentRes.rowCount === 0) {
            throw new Error('Silakan buat Pengaturan Tampilan (Turnamen) terlebih dahulu.');
        }
        const tournamentId = tournamentRes.rows[0].id;

        const matchRes = await client.query(
            `INSERT INTO matches (tournament_id, category, scheduled_date, status)
             VALUES ($1, $2, $3, 'scheduled') RETURNING id`,
            [tournamentId, dbCategory, match_date]
        );
        const matchId = matchRes.rows[0].id;

        for (const p of players) {
            const playerRes = await client.query(
                `INSERT INTO players (full_name, club_name, age)
                 VALUES ($1, $2, $3) RETURNING id`,
                [p.full_name, p.club_name, p.age ? parseInt(p.age) : null]
            );
            const playerId = playerRes.rows[0].id;

            const teamEnum = p.team_number === 1 ? 'A' : 'B';

            await client.query(
                `INSERT INTO match_players (match_id, player_id, team)
                 VALUES ($1, $2, $3)`,
                [matchId, playerId, teamEnum]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({
            message: 'Pertandingan berhasil disimpan!',
            match_id: matchId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saat insert pertandingan: >>>', error.message);
        res.status(500).json({
            error: error.message || 'Gagal menyimpan pertandingan ke database.'
        });
    } finally {
        client.release();
    }
};

export const getMatches = async (req, res) => {
    const client = await db.connect();
    try {
        const query = `
            SELECT
                m.id AS match_id,
                m.category,
                m.status,
                m.scheduled_date,
                m.scheduled_time,
                m.duration_minutes,
                m.umpire_id,
                u.username AS umpire_username,
                TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) AS umpire_fullname,
                t.name AS tournament_name,
                (
                    SELECT json_agg(
                                   json_build_object(
                                           'full_name', p.full_name,
                                           'team', mp.team,
                                           'club_name', p.club_name
                                   )
                           )
                    FROM match_players mp
                             JOIN players p ON mp.player_id = p.id
                    WHERE mp.match_id = m.id
                ) AS players,
                (
                    SELECT json_agg(
                                   json_build_object(
                                           'set', ms.set_number,
                                           'a', ms.team_a_points,
                                           'b', ms.team_b_points,
                                           'winner', ms.winner_team
                                   ) ORDER BY ms.set_number ASC
                           )
                    FROM match_scores ms
                    WHERE ms.match_id = m.id
                ) AS final_scores
            FROM matches m
                     LEFT JOIN tournaments t ON m.tournament_id = t.id
                     LEFT JOIN users u ON m.umpire_id = u.id
            ORDER BY COALESCE(m.updated_at, m.created_at) DESC, m.id DESC;
        `;
        const result = await client.query(query);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error saat mengambil data pertandingan:', error.message);
        res.status(500).json({ error: 'Gagal mengambil daftar pertandingan dari database.' });
    } finally {
        client.release();
    }
};

// --- DI SINI PERBAIKAN TOTALNYA SUDAH SINKRON DAN UTUH ---
export const getMatchById = async (req, res) => {
    const client = await db.connect();
    try {
        const { id } = req.params;
        const query = `
            SELECT
                m.id AS match_id,
                m.category,
                m.status,
                m.scheduled_date,
                m.scheduled_time,
                t.name AS tournament_name,
                t.theme_primary,
                t.theme_secondary,
                t.logo_url,
                t.logo_pbsi_url,
                (
                    SELECT json_agg(
                                   json_build_object(
                                           'full_name', p.full_name,
                                           'team', mp.team,
                                           'club_name', p.club_name
                                   )
                           )
                    FROM match_players mp
                             JOIN players p ON mp.player_id = p.id
                    WHERE mp.match_id = m.id
                ) AS players
            FROM matches m
                     LEFT JOIN tournaments t ON m.tournament_id = t.id
            WHERE m.id = $1;
        `;
        const result = await client.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pertandingan tidak ditemukan' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error saat mengambil detail pertandingan:', error.message);
        res.status(500).json({ error: 'Gagal mengambil detail pertandingan.' });
    } finally {
        client.release();
    }
};

export const finishMatch = async (req, res) => {
    const client = await db.connect();

    try {
        const matchId = req.params.id;
        const { final_scores, duration_minutes } = req.body;

        await client.query('BEGIN');

        await client.query(
            `UPDATE matches
             SET status = 'finished', duration_minutes = $2, updated_at = NOW()
             WHERE id = $1`,
            [matchId, duration_minutes || 0]
        );

        await client.query(`DELETE FROM match_scores WHERE match_id = $1`, [matchId]);

        for (let score of final_scores) {
            if (score.a > 0 || score.b > 0 || score.winner !== null) {
                await client.query(
                    `INSERT INTO match_scores
                         (match_id, set_number, team_a_points, team_b_points, winner_team)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [matchId, score.set, score.a, score.b, score.winner]
                );
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Pertandingan berhasil diakhiri dan skor disimpan!' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error saat menyimpan skor akhir:', err);
        res.status(500).json({ error: 'Gagal menyimpan skor pertandingan.' });
    } finally {
        client.release();
    }
};

export const deleteMatch = async (req, res) => {
    const client = await db.connect();
    try {
        const matchId = req.params.id;
        await client.query('BEGIN');

        const playersRes = await client.query(
            `SELECT player_id FROM match_players WHERE match_id = $1`,
            [matchId]
        );
        const playerIds = playersRes.rows.map(row => row.player_id);

        await client.query(`DELETE FROM match_scores WHERE match_id = $1`, [matchId]);
        await client.query(`DELETE FROM match_players WHERE match_id = $1`, [matchId]);
        await client.query(`DELETE FROM matches WHERE id = $1`, [matchId]);

        if (playerIds.length > 0) {
            const placeholders = playerIds.map((_, i) => `$${i + 1}`).join(',');
            await client.query(`DELETE FROM players WHERE id IN (${placeholders})`, playerIds);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Pertandingan beserta pemain berhasil dihapus bersih!' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error saat menghapus pertandingan:', error.message);
        res.status(500).json({ error: 'Gagal menghapus pertandingan.' });
    } finally {
        client.release();
    }
};

export const assignUmpire = async (req, res) => {
    const client = await db.connect();
    try {
        const matchId = req.params.id;
        const { umpire_id } = req.body;

        const result = await client.query(
            `UPDATE matches SET umpire_id = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
            [umpire_id, matchId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pertandingan tidak ditemukan' });
        }

        res.status(200).json({ message: 'Wasit berhasil ditugaskan!' });
    } catch (error) {
        console.error('❌ Error saat menugaskan wasit:', error.message);
        res.status(500).json({ error: 'Gagal menugaskan wasit ke database.' });
    } finally {
        client.release();
    }
};