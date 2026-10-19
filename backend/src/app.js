const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const { testConnection } = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: [config.frontendOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers with strict size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: 'Rate limit exceeded', message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'ok',
    service: 'CodeSense AI Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'error',
    aiProvider: config.ai.provider,
    aiModel: config.ai.model
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Custom 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER UNCAUGHT ERROR]', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'production' ? 'An unexpected error occurred.' : err.message
  });
});

// Start Server if invoked directly
if (require.main === module) {
  testConnection().then(() => {
    app.listen(config.port, () => {
      console.log(`🚀 CodeSense AI Server running at http://localhost:${config.port}`);
      console.log(`🌐 Approved Frontend Origin: ${config.frontendOrigin}`);
    });
  });
}

module.exports = app;
