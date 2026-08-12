import express, { Application } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app: Application = express();

// Enable CORS with configured frontend URL
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
      if (isLocal || origin === env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Express Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root & Health Check Endpoints (for Render platform probes and keep-alive pingers)
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Mini ERP + CRM Backend API is online',
    healthCheck: '/api/v1/health',
    timestamp: new Date().toISOString(),
  });
});

app.head('/', (_req, res) => {
  res.status(200).end();
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// API Base Routes (supports /api, /api/v1, or direct root endpoints like /auth/login)
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);
app.use('/', apiRouter);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
