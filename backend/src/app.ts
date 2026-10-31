import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { healthRouter } from './routes/health.routes.js';
import { repositoryRouter } from './routes/repository.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { graphRouter } from './routes/graph.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite inline styles & canvas/SVG graphs
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = [
        config.corsOrigin,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5000',
      ];

      if (allowed.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Body Parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Lightweight Cookie Parser Middleware
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  (req as any).cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest) {
        (req as any).cookies[name] = decodeURIComponent(rest.join('='));
      }
    });
  }
  next();
});

// API Endpoints
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/repository', repositoryRouter);
app.use('/api/ai', aiRouter);
app.use('/api/graph', graphRouter);

// Serve Frontend in Production (Cloudways deployment support)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);
