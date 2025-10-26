import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root (one level up from src/)
const envPath = path.join(__dirname, '..', '.env');
console.log('🔍 Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Debug: Log environment variables
console.log('🔍 Environment variables loaded:');
console.log('MONGO_URI_SOURCE:', process.env.MONGO_URI_SOURCE ? 'Present' : 'Missing');
console.log('MONGO_URI_RESULTS:', process.env.MONGO_URI_RESULTS ? 'Present' : 'Missing');
console.log('PORT:', process.env.PORT || 'Not set');

// Fallback: Set environment variables directly if not loaded
if (!process.env.MONGO_URI_SOURCE) {
  process.env.MONGO_URI_SOURCE = 'mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/Bandhan?retryWrites=true&w=majority&appName=PsychometricCluster';
  console.log('🔧 Fallback: Set MONGO_URI_SOURCE');
}
if (!process.env.MONGO_URI_RESULTS) {
  process.env.MONGO_URI_RESULTS = 'mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/demo_test_answer?retryWrites=true&w=majority&appName=PsychometricCluster';
  console.log('🔧 Fallback: Set MONGO_URI_RESULTS to demo_test_answer');
}
if (!process.env.PORT) {
  process.env.PORT = '5000';
  console.log('🔧 Fallback: Set PORT');
}
if (!process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  console.log('🔧 Fallback: Set CORS_ORIGIN to 5173');
}
if (!process.env.SMTP_USER) {
  process.env.SMTP_USER = 'ikscbandhan@gmail.com';
  console.log('🔧 Fallback: Set SMTP_USER');
}
if (!process.env.SMTP_PASS) {
  process.env.SMTP_PASS = 'ikscbandhan123';
  console.log('🔧 Fallback: Set SMTP_PASS');
}
if (!process.env.FROM_EMAIL) {
  process.env.FROM_EMAIL = 'ikscbandhan@gmail.com';
  console.log('🔧 Fallback: Set FROM_EMAIL');
}
if (!process.env.FROM_NAME) {
  process.env.FROM_NAME = 'IKSC Bandhan';
  console.log('🔧 Fallback: Set FROM_NAME');
}

// Boot guards - catch all errors
process.on("uncaughtException", e => console.error("[FATAL] uncaughtException:", e));
process.on("unhandledRejection", e => console.error("[FATAL] unhandledRejection:", e));
console.log("[BOOT] NODE_ENV:", process.env.NODE_ENV, "SAFE_MODE:", process.env.SAFE_MODE || "0");

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
    console.log("[IKSC-BACKEND] build:", process.env.BUILD_ID || "no-build-id");
    
    logger.info('🚀 Starting server initialization...');
    
    // Debug environment variables
    logger.info('🔍 Environment check:');
    logger.info('MONGO_URI_SOURCE:', process.env.MONGO_URI_SOURCE ? 'Present' : 'Missing');
    logger.info('MONGO_URI_RESULTS:', process.env.MONGO_URI_RESULTS ? 'Present' : 'Missing');
    logger.info('PORT:', process.env.PORT || 'Not set');
    
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
      console.log("API listening on", config.port);
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 CORS Origin: ${config.corsOrigin}`);
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
