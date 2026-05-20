import db from '../db.js';

// GET: Dipanggil oleh React (Frontend) untuk menampilkan isi dropdown
export const getVarRecordsByMatch = async (req, res) => {
    const client = await db.connect();
    try {
        const { id } = req.params; // Ini adalah match_id
        const result = await client.query(
            `SELECT * FROM var_records WHERE match_id = $1 ORDER BY created_at DESC`,
            [id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error mengambil data VAR:', error);
        res.status(500).json({ error: 'Gagal mengambil daftar rekaman VAR' });
    } finally {
        client.release();
    }
};

// POST: Dipanggil oleh Jetson Nano saat kok jatuh untuk menyimpan 11 frame
export const saveVarRecord = async (req, res) => {
    const client = await db.connect();
    try {
        const { id } = req.params; // Ini adalah match_id
        const { set_number, score_state, frames_path } = req.body;

        const result = await client.query(
            `INSERT INTO var_records (match_id, set_number, score_state, frames_path) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [id, set_number, score_state, JSON.stringify(frames_path)] // Array diubah ke JSON string
        );
        res.status(201).json({
            message: 'Rekaman VAR berhasil diamankan!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Error menyimpan data VAR:', error);
        res.status(500).json({ error: 'Gagal menyimpan rekaman VAR dari kamera' });
    } finally {
        client.release();
    }
};