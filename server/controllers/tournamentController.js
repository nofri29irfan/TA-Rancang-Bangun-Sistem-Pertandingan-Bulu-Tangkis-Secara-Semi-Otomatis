import db from '../db.js';

// FUNGSI BARU: Untuk Mengambil Data (Agar Lokasi Terbaca)
export const getTournamentSettings = async (req, res) => {
    const client = await db.connect();
    try {
        const organizerId = 1;
        const result = await client.query('SELECT * FROM tournaments WHERE organizer_id = $1', [organizerId]);
        if (result.rowCount > 0) {
            res.status(200).json({ data: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Pengaturan belum dibuat' });
        }
    } catch (err) {
        console.error('Error Get Tournaments:', err);
        res.status(500).json({ error: 'Gagal mengambil data turnamen' });
    } finally {
        client.release();
    }
};

// FUNGSI LAMA: Untuk Menyimpan Data (Sudah aman)
export const saveTournamentSettings = async (req, res) => {
    const client = await db.connect();
    try {
        const organizerId = 1;
        const { name, subtitle, start_date, end_date, location, theme_primary, theme_secondary } = req.body;

        let uploadedLogoUrl = null;
        let uploadedLogoPbsiUrl = null;

        if (req.files) {
            if (req.files['logo']) uploadedLogoUrl = `http://localhost:3000/uploads/${req.files['logo'][0].filename}`;
            if (req.files['logo_pbsi']) uploadedLogoPbsiUrl = `http://localhost:3000/uploads/${req.files['logo_pbsi'][0].filename}`;
        }

        await client.query('BEGIN');
        const checkRes = await client.query(`SELECT * FROM tournaments WHERE organizer_id = $1`, [organizerId]);

        let result;
        if (checkRes.rowCount > 0) {
            const existingData = checkRes.rows[0];
            const finalLogoUrl = uploadedLogoUrl || existingData.logo_url;
            const finalLogoPbsiUrl = uploadedLogoPbsiUrl || existingData.logo_pbsi_url;

            const queryUpdate = `
                UPDATE tournaments
                SET name = $1, subtitle = $2, start_date = $3, end_date = $4,
                    location = $5, theme_primary = $6, theme_secondary = $7,
                    logo_url = $8, logo_pbsi_url = $9
                WHERE organizer_id = $10 RETURNING *;
            `;
            result = await client.query(queryUpdate, [
                name, subtitle, start_date, end_date, location, theme_primary, theme_secondary,
                finalLogoUrl, finalLogoPbsiUrl, organizerId
            ]);
        } else {
            const queryInsert = `
                INSERT INTO tournaments (
                    organizer_id, name, subtitle, start_date, end_date,
                    location, theme_primary, theme_secondary, logo_url, logo_pbsi_url, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft') RETURNING *;
            `;
            result = await client.query(queryInsert, [
                organizerId, name, subtitle, start_date, end_date, location, theme_primary, theme_secondary,
                uploadedLogoUrl, uploadedLogoPbsiUrl
            ]);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'Pengaturan berhasil disimpan!', data: result.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error saat menyimpan pengaturan turnamen: >>>', err.message);
        res.status(500).json({ error: 'Gagal menyimpan pengaturan tampilan.', detail: err.message });
    } finally {
        client.release();
    }
};