import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tracksRouter from './routes/tracks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'Spotify Clone API is fully operational'
  });
});

// Tracks API
app.use('/api/tracks', tracksRouter);

// Start server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🎵 Spotify Clone Backend running on:`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`=========================================`);
});
