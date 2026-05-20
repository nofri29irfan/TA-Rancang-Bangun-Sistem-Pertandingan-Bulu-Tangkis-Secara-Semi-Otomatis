import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { getStats, getRecentMatches } from '../controllers/dashboardController.js';

const router = express.Router();

// All dashboard routes require authenticated organizer
router.use(verifyToken, requireRole('organizer'));

// GET /api/dashboard/stats
router.get('/stats', getStats);

// GET /api/dashboard/recent-matches
router.get('/recent-matches', getRecentMatches);

export default router;
