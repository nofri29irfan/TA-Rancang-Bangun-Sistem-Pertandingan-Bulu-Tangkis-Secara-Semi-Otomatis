import jwt from 'jsonwebtoken';

/**
 * Middleware: Verify JWT Token
 * Extracts token from Authorization header (Bearer <token>)
 * and injects decoded user data into req.user
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token sudah kadaluarsa. Silakan login kembali.' });
    }
    return res.status(401).json({ error: 'Token tidak valid.' });
  }
};

/**
 * Middleware: Require specific role(s)
 * Usage: requireRole('organizer') or requireRole('organizer', 'umpire')
 * Must be used AFTER verifyToken
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autentikasi diperlukan.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Akses ditolak. Hanya ${roles.join(' atau ')} yang diizinkan.` 
      });
    }

    next();
  };
};
