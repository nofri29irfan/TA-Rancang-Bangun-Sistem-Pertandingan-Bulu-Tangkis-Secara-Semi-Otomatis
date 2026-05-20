import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * Generate a random password for newly registered umpires
 * Format: WAS-XXXXXX (6 random alphanumeric characters)
 */
function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = 'WAS-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST /api/umpires
 * Register a new umpire (by organizer)
 * Auto-generates a random password and returns it to the organizer
 */
export const createUmpire = async (req, res) => {
  try {
    const { username, first_name, last_name, email, phone, license_number, experience_years } = req.body;

    // Validation
    if (!username || !first_name || !email) {
      return res.status(400).json({ error: 'Username, nama depan, dan email wajib diisi.' });
    }

    // Check for duplicate username or email
    const existingUser = await db.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username atau email sudah terdaftar.' });
    }

    // Generate random password
    const generatedPassword = generateRandomPassword();
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(generatedPassword, saltRounds);

    // Transaction: insert user + umpire profile
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) 
         VALUES ($1, $2, $3, $4, $5, $6, 'umpire') 
         RETURNING id, username, email, first_name, last_name, phone, role, status, created_at`,
        [username, email, passwordHash, first_name, last_name || null, phone || null]
      );

      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO umpires (user_id, license_number, experience_years) 
         VALUES ($1, $2, $3)`,
        [userId, license_number || null, experience_years ? parseInt(experience_years) : 0]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Wasit berhasil didaftarkan.',
        umpire: {
          ...userResult.rows[0],
          license_number: license_number || null,
          experience_years: experience_years ? parseInt(experience_years) : 0,
        },
        generatedPassword, // Show this to organizer so they can give it to the umpire
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Create umpire error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username atau email sudah terdaftar.' });
    }
    res.status(500).json({ error: 'Gagal mendaftarkan wasit.' });
  }
};

/**
 * GET /api/umpires
 * List all umpires with match count
 */
export const getAllUmpires = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id as user_id, u.username, u.email, u.first_name, u.last_name, u.phone, u.status as user_status,
              um.license_number, um.experience_years, um.status as umpire_status, um.created_at,
              COUNT(m.id) as matches_count
       FROM users u
       JOIN umpires um ON u.id = um.user_id
       LEFT JOIN matches m ON m.umpire_id = um.user_id
       WHERE u.status = 'active'
       GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.status,
                um.license_number, um.experience_years, um.status, um.created_at
       ORDER BY um.created_at DESC`
    );

    res.json({ umpires: result.rows });
  } catch (err) {
    console.error('Get all umpires error:', err);
    res.status(500).json({ error: 'Gagal mengambil daftar wasit.' });
  }
};

/**
 * GET /api/umpires/:id
 * Get single umpire detail with match history
 */
export const getUmpireById = async (req, res) => {
  try {
    const { id } = req.params;

    const umpireResult = await db.query(
      `SELECT u.id as user_id, u.username, u.email, u.first_name, u.last_name, u.phone, u.status as user_status,
              um.license_number, um.experience_years, um.status as umpire_status, um.created_at
       FROM users u
       JOIN umpires um ON u.id = um.user_id
       WHERE u.id = $1 AND u.role = 'umpire'`,
      [id]
    );

    if (umpireResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wasit tidak ditemukan.' });
    }

    // Get match history for this umpire
    const matchesResult = await db.query(
      `SELECT m.id, m.category, m.match_type, m.status, m.scheduled_date, m.scheduled_time,
              t.name as tournament_name
       FROM matches m
       JOIN tournaments t ON m.tournament_id = t.id
       WHERE m.umpire_id = $1
       ORDER BY m.scheduled_date DESC
       LIMIT 20`,
      [id]
    );

    res.json({
      umpire: umpireResult.rows[0],
      matches: matchesResult.rows,
    });
  } catch (err) {
    console.error('Get umpire by id error:', err);
    res.status(500).json({ error: 'Gagal mengambil data wasit.' });
  }
};

/**
 * PUT /api/umpires/:id
 * Update umpire profile data
 */
export const updateUmpire = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, license_number, experience_years, umpire_status } = req.body;

    // Check umpire exists
    const existing = await db.query(
      'SELECT u.id FROM users u JOIN umpires um ON u.id = um.user_id WHERE u.id = $1 AND u.role = $2',
      [id, 'umpire']
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Wasit tidak ditemukan.' });
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Update users table
      if (first_name || last_name || email || phone) {
        await client.query(
          `UPDATE users SET 
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            email = COALESCE($3, email),
            phone = COALESCE($4, phone)
           WHERE id = $5`,
          [first_name || null, last_name || null, email || null, phone || null, id]
        );
      }

      // Update umpires table
      if (license_number !== undefined || experience_years !== undefined || umpire_status) {
        await client.query(
          `UPDATE umpires SET 
            license_number = COALESCE($1, license_number),
            experience_years = COALESCE($2, experience_years),
            status = COALESCE($3, status)
           WHERE user_id = $4`,
          [
            license_number !== undefined ? license_number : null,
            experience_years !== undefined ? parseInt(experience_years) : null,
            umpire_status || null,
            id,
          ]
        );
      }

      await client.query('COMMIT');

      // Fetch updated data
      const updated = await db.query(
        `SELECT u.id as user_id, u.username, u.email, u.first_name, u.last_name, u.phone, u.status as user_status,
                um.license_number, um.experience_years, um.status as umpire_status
         FROM users u
         JOIN umpires um ON u.id = um.user_id
         WHERE u.id = $1`,
        [id]
      );

      res.json({ message: 'Data wasit berhasil diperbarui.', umpire: updated.rows[0] });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Update umpire error:', err);
    res.status(500).json({ error: 'Gagal memperbarui data wasit.' });
  }
};

/**
 * DELETE /api/umpires/:id
 * Soft-delete: sets user status to 'inactive'
 */
export const deleteUmpire = async (req, res) => {
  try {
    const { id } = req.params;

    // Check umpire exists and is active
    const existing = await db.query(
      "SELECT u.id FROM users u WHERE u.id = $1 AND u.role = 'umpire' AND u.status = 'active'",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Wasit tidak ditemukan atau sudah tidak aktif.' });
    }

    // Soft delete: set user status to inactive & umpire status to inactive
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        "UPDATE users SET status = 'inactive' WHERE id = $1",
        [id]
      );

      await client.query(
        "UPDATE umpires SET status = 'inactive' WHERE user_id = $1",
        [id]
      );

      await client.query('COMMIT');

      res.json({ message: 'Wasit berhasil dinonaktifkan.' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Delete umpire error:', err);
    res.status(500).json({ error: 'Gagal menonaktifkan wasit.' });
  }
};
