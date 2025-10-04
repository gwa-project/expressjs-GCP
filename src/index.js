import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, syncDatabase } from './lib/db.js';
import { ensureDefaultAdmin, ensureDefaultContent } from './lib/seed.js';
import authRoutes from './routes/auth.js';
import carRoutes from './routes/cars.js';
import posterRoutes from './routes/posters.js';
import { corsOptions } from './config/cors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serve static uploaded files
// In production (Cloud Run), use /tmp directory
const uploadPath = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadPath));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/posters', posterRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ success: false, error: 'Terjadi error pada server' });
});

let initialized = false;

async function ensureInitialized() {
  await connectDB();
  if (!initialized) {
    // Sync database tables (create if not exist)
    await syncDatabase({ alter: process.env.NODE_ENV !== 'production' });
    await ensureDefaultAdmin();
    await ensureDefaultContent();
    initialized = true;
  }
}

// Initialize and start server
ensureInitialized()
  .then(() => {
    const port = process.env.PORT || 8080;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Sena Rencar API running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

export default app;
