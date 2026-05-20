import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { 
  createUmpire, 
  getAllUmpires, 
  getUmpireById, 
  updateUmpire, 
  deleteUmpire 
} from '../controllers/umpireController.js';

const router = express.Router();

// All umpire management routes require authenticated organizer
router.use(verifyToken, requireRole('organizer'));

// POST   /api/umpires        → Register new umpire
router.post('/', createUmpire);

// GET    /api/umpires         → List all umpires
router.get('/', getAllUmpires);

// GET    /api/umpires/:id     → Get umpire detail
router.get('/:id', getUmpireById);

// PUT    /api/umpires/:id     → Update umpire data
router.put('/:id', updateUmpire);

// DELETE /api/umpires/:id     → Soft-delete umpire
router.delete('/:id', deleteUmpire);

export default router;
