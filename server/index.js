import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import umpireRoutes from './routes/umpires.js';
// BARIS YANG DITAMBAHKAN: Import routes untuk matches
import matchRoutes from './routes/matches.js';
import tournamentRoutes from './routes/tournaments.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development, allow all origins. Consider restricting this in production.
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// BARIS BARU: Izinkan browser membaca file statis (gambar) dari folder public/uploads
app.use('/uploads', express.static('public/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/umpires', umpireRoutes);
// BARIS YANG DITAMBAHKAN: Daftarkan endpoint API matches
app.use('/api/matches', matchRoutes);
app.use('/api/tournaments', tournamentRoutes);

// Socket.io for real-time scoring
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Future: listen to score updates and broadcast
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});