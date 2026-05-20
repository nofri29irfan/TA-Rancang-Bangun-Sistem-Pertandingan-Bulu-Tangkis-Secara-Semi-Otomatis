import db from '../db.js';

export const getStats = async (req, res) => {
  try {
    const organizerId = req.user.id;

    const totalMatchesResult = await db.query(
        `SELECT COUNT(m.id) as count FROM matches m
          JOIN tournaments t ON m.tournament_id = t.id WHERE t.organizer_id = $1`,
        [organizerId]
    );

    const totalPlayersResult = await db.query(
        `SELECT COUNT(DISTINCT mp.player_id) as count FROM match_players mp
          JOIN matches m ON mp.match_id = m.id
           JOIN tournaments t ON m.tournament_id = t.id WHERE t.organizer_id = $1`,
        [organizerId]
    );

    const totalUmpiresResult = await db.query(
        `SELECT COUNT(u.user_id) as count FROM umpires u 
       JOIN users us ON u.user_id = us.id WHERE us.status = 'active'`
    );

    // MENGGUNAKAN m.scheduled_date SESUAI DATABASE
    const matchesTodayResult = await db.query(
        `SELECT COUNT(m.id) as count FROM matches m
          JOIN tournaments t ON m.tournament_id = t.id
         WHERE t.organizer_id = $1 AND DATE(m.scheduled_date) = CURRENT_DATE`,
        [organizerId]
    );

    res.json({
      totalMatches: parseInt(totalMatchesResult.rows[0].count),
      totalPlayers: parseInt(totalPlayersResult.rows[0].count),
      totalUmpires: parseInt(totalUmpiresResult.rows[0].count),
      matchesToday: parseInt(matchesTodayResult.rows[0].count),
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Gagal mengambil data statistik dashboard.' });
  }
};

export const getRecentMatches = async (req, res) => {
  try {
    const organizerId = req.user.id;

    // Mengambil data dengan kolom asli, lalu di-alias (AS) agar cocok dengan Frontend
    const matchesResult = await db.query(
        `SELECT m.id, m.category AS match_category, m.match_type AS round_name, m.status,
                m.scheduled_date AS match_date, t.name as tournament_name
         FROM matches m
                JOIN tournaments t ON m.tournament_id = t.id
         WHERE t.organizer_id = $1 ORDER BY m.scheduled_date DESC LIMIT 10`,
        [organizerId]
    );

    const matches = await Promise.all(
        matchesResult.rows.map(async (match) => {

          // MENGGUNAKAN mp.team SESUAI DATABASE ANDA
          const playersResult = await db.query(
              `SELECT mp.team, p.id, p.full_name
               FROM match_players mp
                      JOIN players p ON mp.player_id = p.id
               WHERE mp.match_id = $1 ORDER BY mp.team`,
              [match.id]
          );

          // Filter berdasarkan value Enum 'A' dan 'B' yang Anda gunakan
          const team1 = playersResult.rows.filter(p => p.team === 'A');
          const team2 = playersResult.rows.filter(p => p.team === 'B');

          // (Opsional) Mengambil skor jika tabel match_scores sudah ada
          let scores = [];
          try {
            const scoresResult = await db.query(
                `SELECT set_number, team_a_score AS score_team_1, team_b_score AS score_team_2 
               FROM match_scores WHERE match_id = $1 ORDER BY set_number`,
                [match.id]
            );
            scores = scoresResult.rows;
          } catch(e) {
            // Abaikan jika tabel scores belum disetup
          }

          return { ...match, team1, team2, scores };
        })
    );

    res.json({ matches });
  } catch (err) {
    console.error('Recent matches error:', err);
    res.status(500).json({ error: 'Gagal mengambil data pertandingan terbaru.' });
  }
};