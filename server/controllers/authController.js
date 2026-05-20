import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username or email
    const userResult = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'User account is not active' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Register endpoint
export const register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, role, organization } = req.body;
    
    const validRoles = ['organizer', 'umpire'];
    const assignedRole = validRoles.includes(role) ? role : 'organizer';

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Using transaction for multiple inserts
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      const newUser = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, role`,
        [username, email, passwordHash, first_name, last_name, phone, assignedRole]
      );
      
      const userId = newUser.rows[0].id;
      
      if (assignedRole === 'organizer') {
        await client.query(
          `INSERT INTO organizers (user_id, organization, phone) VALUES ($1, $2, $3)`,
          [userId, organization || 'Independen', phone]
        );
      } else if (assignedRole === 'umpire') {
        await client.query(
          `INSERT INTO umpires (user_id) VALUES ($1)`,
          [userId]
        );
      }
      
      await client.query('COMMIT');
      
      // Generate JWT right after registration so they are logged in
      const token = jwt.sign(
        { id: userId, username: newUser.rows[0].username, role: assignedRole },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.status(201).json({ 
        message: 'User registered successfully', 
        user: newUser.rows[0],
        token
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error registering user, might be duplicate username/email.' });
  }
};

/**
 * PUT /api/auth/change-password
 * Allows authenticated users (especially umpires) to change their password
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Password lama dan password baru wajib diisi.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
    }

    // Get current user
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Password lama tidak sesuai.' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password berhasil diubah.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Gagal mengubah password.' });
  }
};
