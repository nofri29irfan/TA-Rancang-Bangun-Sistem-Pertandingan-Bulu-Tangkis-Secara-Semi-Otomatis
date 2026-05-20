import express from 'express';
import { login, register, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register
router.post('/register', register);

// PUT /api/auth/change-password (requires authentication)
router.put('/change-password', verifyToken, changePassword);

export default router;
