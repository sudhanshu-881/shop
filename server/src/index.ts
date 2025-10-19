import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import createRoutes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import DatabaseService from './services/database';

const app = express();

// Initialize database service
const databaseService = new DatabaseService(config.database);
const supabase = databaseService.getClient();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.http(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'InvenShop API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api', createRoutes(supabase));

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const isHealthy = await databaseService.healthCheck();
    if (isHealthy) {
      logger.info('Database connection is healthy');
    } else {
      logger.error('Database connection is unhealthy');
    }
  } catch (error) {
    logger.error('Database health check failed:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    // Check database health
    await checkDatabaseHealth();

    // Start listening
    app.listen(config.port, () => {
      logger.info(`🚀 InvenShop API server running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 API URL: http://localhost:${config.port}/api`);
      logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;