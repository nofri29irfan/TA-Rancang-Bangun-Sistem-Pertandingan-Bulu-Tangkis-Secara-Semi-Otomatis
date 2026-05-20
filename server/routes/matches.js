import express from 'express';
import { createMatch, getMatches, getMatchById, finishMatch, deleteMatch, assignUmpire } from '../controllers/matchController.js';
import { getVarRecordsByMatch, saveVarRecord } from '../controllers/varController.js'; // <-- IMPORT BARU DITAMBAHKAN DI SINI
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createMatch);
router.get('/', verifyToken, getMatches);
router.get('/:id', verifyToken, getMatchById);

// ENDPOINT: Untuk menyimpan skor dan mengakhiri pertandingan
router.put('/:id/finish', verifyToken, finishMatch);

// ENDPOINT BARU: Untuk menugaskan wasit ke pertandingan
router.put('/:id/assign-umpire', verifyToken, assignUmpire);

// ENDPOINT BARU: Untuk menghapus pertandingan dan pemain
router.delete('/:id', verifyToken, deleteMatch);

// --- ENDPOINT VAR STREAMING BARU ---
// Pakai verifyToken karena dipanggil dari browser Frontend (React) oleh akun wasit
router.get('/:id/var', verifyToken, getVarRecordsByMatch);
// Sengaja tanpa verifyToken agar perangkat keras Jetson Nano langsung bisa tembak data
router.post('/:id/var', saveVarRecord);

export default router;