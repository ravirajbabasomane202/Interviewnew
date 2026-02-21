import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import roadmapRoutes from './routes/roadmapRoutes.js';
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/roadmaps', roadmapRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch((err) => {
    console.error('Mongo connection failed', err);
    process.exit(1);
  });
