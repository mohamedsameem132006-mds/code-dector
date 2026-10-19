const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = [
  'DATABASE_HOST',
  'DATABASE_USER',
  'DATABASE_NAME'
];

for (const v of requiredVars) {
  if (!process.env[v] && v !== 'DATABASE_PASSWORD') {
    console.warn(`[WARN] Config: ${v} is not set in environment, using defaults if available.`);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'codesense_db',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    charset: 'utf8mb4'
  },
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-3.8-flash',
    provider: process.env.AI_PROVIDER || 'gemini'
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'codesense-ai-app',
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || ''
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
  }
};
