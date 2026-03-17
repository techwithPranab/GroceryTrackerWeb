'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

const { limiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { frontendUrl, nodeEnv } = require('./config/env');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const shoppingListRoutes = require('./routes/shoppingListRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const locationRoutes = require('./routes/locationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const householdRoutes = require('./routes/householdRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ─── Security & Compression ──────────────────────────────────────────────────
app.use(helmet());
app.use(compression());

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
if (nodeEnv !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
app.use('/api', limiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: nodeEnv,
    version: '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/household', householdRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
