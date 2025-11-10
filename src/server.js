import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root (one level up from src/)
const envPath = path.join(__dirname, '..', '.env');
if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 Loading .env from:', envPath);
}
dotenv.config({ path: envPath });

// Debug: Log environment variables (development only)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 Environment variables loaded:');
  console.log('MONGO_URI_SOURCE:', process.env.MONGO_URI_SOURCE ? 'Present' : 'Missing');
  console.log('MONGO_URI_RESULTS:', process.env.MONGO_URI_RESULTS ? 'Present' : 'Missing');
  console.log('PORT:', process.env.PORT || 'Not set');
}

// Validate required environment variables (production safety)
const requiredEnvVars = ['MONGO_URI_SOURCE', 'MONGO_URI_RESULTS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please create a .env file based on env.example');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️ Running in development mode with missing env vars - some features may not work');
  }
}

// Set defaults only for development (not production)
if (process.env.NODE_ENV !== 'production') {
  if (!process.env.PORT) {
    process.env.PORT = '5000';
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Development: Set PORT to 5000');
    }
  }
  if (!process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN = 'http://localhost:5173';
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Development: Set CORS_ORIGIN to localhost:5173');
    }
  }
  if (!process.env.DEFAULT_QUIZ_ID) {
    process.env.DEFAULT_QUIZ_ID = 'divorce_conflict_v1';
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Development: Set DEFAULT_QUIZ_ID to divorce_conflict_v1');
    }
  }
}

// Boot guards - catch all errors (always log errors)
process.on("uncaughtException", e => console.error("[FATAL] uncaughtException:", e));
process.on("unhandledRejection", e => console.error("[FATAL] unhandledRejection:", e));
if (process.env.NODE_ENV !== 'production') {
  console.log("[BOOT] NODE_ENV:", process.env.NODE_ENV, "SAFE_MODE:", process.env.SAFE_MODE || "0");
}

import { config } from './config/env.js';
import { connectDbs } from './config/db.js';
import { createMailer } from './config/mailer.js';
import { logger } from './utils/logger.js';
import { createApp } from './app.js';

// Import models
import { getQuizModel } from './models/Quiz.js';
import { getAttemptModel } from './models/Attempt.js';
import { getResultModel } from './models/Result.js';
import { getAttendanceModel } from './models/Attendance.js';

// Import services
import { QuizService } from './services/quiz.service.js';
import { ScoringService } from './services/scoring.service.js';
import { AttemptService } from './services/attempt.service.js';
import { MailService } from './services/mail.service.js';
import { ModelFactory } from './services/model.factory.js';

const startServer = async () => {
  try {
    // Build provenance for production debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log("[IKSC-BACKEND] build:", process.env.BUILD_ID || "no-build-id");
    }
    
    logger.info('🚀 Starting server initialization...');
    
    // Debug environment variables (development only)
    if (process.env.NODE_ENV !== 'production') {
      logger.info('🔍 Environment check:');
      logger.info('MONGO_URI_SOURCE:', process.env.MONGO_URI_SOURCE ? 'Present' : 'Missing');
      logger.info('MONGO_URI_RESULTS:', process.env.MONGO_URI_RESULTS ? 'Present' : 'Missing');
      logger.info('PORT:', process.env.PORT || 'Not set');
    }
    
    // Connect to databases
    logger.info('📊 Connecting to databases...');
    const { source, results } = await connectDbs();

    // Initialize models
    logger.info('📋 Initializing models...');
    const quizModel = getQuizModel(source);
    const modelFactory = new ModelFactory(results);
    logger.info('✅ Models initialized');
    
    // Initialize services
    logger.info('⚙️ Initializing services...');
    const quizService = new QuizService(quizModel);
    const scoringService = new ScoringService();
    const attemptService = new AttemptService(modelFactory);
    logger.info('✅ Services initialized');
    
    // Initialize mailer
    logger.info('📧 Initializing mailer...');
    const transporter = createMailer();
    const mailService = new MailService(transporter);
    logger.info('✅ Mailer initialized');

    // Create app
    logger.info('🌐 Creating Express app...');
    const app = createApp(quizService, attemptService, scoringService, mailService);
    logger.info('✅ Express app created');

    // Start server
    logger.info('🎯 Starting HTTP server...');
    const server = app.listen(config.port, "0.0.0.0", () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log("API listening on", config.port);
      }
      logger.info(`🚀 Server running on port ${config.port}`);
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`📊 Environment: ${config.nodeEnv}`);
        logger.info(`🌐 CORS Origin: ${config.corsOrigin}`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('✅ HTTP server closed');
        
        // Close database connections
        source.close();
        results.close();
        
        logger.info('✅ Database connections closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
