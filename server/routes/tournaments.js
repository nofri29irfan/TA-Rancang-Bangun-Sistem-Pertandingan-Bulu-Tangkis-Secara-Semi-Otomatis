import express from 'express';
import multer from 'multer';
import path from 'path';
import { saveTournamentSettings, getTournamentSettings } from '../controllers/tournamentController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// BARIS BARU: Membuka pintu agar frontend bisa mengambil lokasi
router.get('/', getTournamentSettings);

// BARIS LAMA: Untuk menerima form upload
router.post('/', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'logo_pbsi', maxCount: 1 }
]), saveTournamentSettings);

export default router;