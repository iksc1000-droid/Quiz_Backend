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

// Validate production-specific environment variables
if (process.env.NODE_ENV === 'production') {
  const productionRequiredVars = {
    'CORS_ORIGIN': 'Frontend domain for CORS',
    'BRAND_SITE': 'Frontend URL for email links',
    'SMTP_PASS': 'Gmail App Password for sending emails'
  };
  
  const missingProdVars = Object.keys(productionRequiredVars).filter(varName => !process.env[varName]);
  
  if (missingProdVars.length > 0) {
    console.error('❌ Missing required production environment variables:');
    missingProdVars.forEach(varName => {
      console.error(`   - ${varName}: ${productionRequiredVars[varName]}`);
    });
    console.error('Please set these in your .env file before deploying to production.');
    process.exit(1);
  }
  
  // Validate SMTP password format
  if (process.env.SMTP_PASS) {
    const pass = process.env.SMTP_PASS.trim();
    if (pass.includes(' ')) {
      console.error('❌ SMTP_PASS contains spaces! Gmail App Passwords must not have spaces.');
      console.error('   Current value:', pass);
      console.error('   Should be:', pass.replace(/\s/g, ''));
      process.exit(1);
    }
    if (pass.length !== 16) {
      console.warn('⚠️  SMTP_PASS length is not 16 characters. Gmail App Passwords are typically 16 chars.');
    }
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
    
    // Verify SMTP connection on startup
    try {
      logger.info('🔍 Verifying SMTP connection...');
      
      // Log SMTP config (without password) for debugging
      if (process.env.NODE_ENV !== 'production') {
        logger.info('📧 SMTP Config:', {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 465,
          user: process.env.SMTP_USER || 'not set',
          passLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
          passHasSpaces: process.env.SMTP_PASS ? process.env.SMTP_PASS.includes(' ') : false
        });
      }
      
      await transporter.verify();
      logger.info('✅ SMTP connection verified successfully');
    } catch (error) {
      // Determine the actual error reason
      let errorReason = 'Unknown error';
      
      if (error.code === 'EAUTH') {
        errorReason = 'SMTP authentication failed - check SMTP_USER and SMTP_PASS in .env file';
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        errorReason = 'SMTP connection failed - check internet connection and SMTP_HOST/port settings';
      } else if (error.responseCode === 535) {
        errorReason = 'Gmail authentication failed - verify App Password is correct (16 chars, no spaces) and 2FA is enabled';
      } else if (error.responseCode === 550) {
        errorReason = 'Email rejected by server - check sender email address and Gmail account settings';
      } else if (error.message) {
        errorReason = error.message;
      }
      
      logger.error('❌ SMTP connection verification failed');
      logger.error(`❌ Error reason: ${errorReason}`);
      
      // Log the full error object for debugging
      const errorDetails = {
        message: error.message,
        code: error.code,
        responseCode: error.responseCode,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      };
      
      // Try to extract more details from the error
      if (error.response) {
        errorDetails.fullResponse = error.response;
      }
      if (error.code) {
        errorDetails.errorCode = error.code;
      }
      
      logger.error('❌ SMTP Error details:', errorDetails);
      
      // Log the actual response message if available
      if (error.response) {
        logger.error(`❌ Gmail response: ${error.response}`);
      }
      
      if (process.env.NODE_ENV !== 'production') {
        logger.error('❌ Full error stack:', error.stack);
      }
      
      // Check for common issues
      const passHasSpaces = process.env.SMTP_PASS ? process.env.SMTP_PASS.includes(' ') : false;
      const passLength = process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0;
      
      logger.warn('⚠️  Email sending may fail. Please check SMTP configuration in .env file.');
      logger.warn('⚠️  Common issues:');
      if (passHasSpaces) {
        logger.warn(`   ❌ SMTP_PASS has spaces (current length: ${passLength}, should be 16 chars with NO spaces)`);
      } else {
        logger.warn(`   ✓ SMTP_PASS format looks correct (length: ${passLength})`);
      }
      logger.warn('   2. Wrong App Password (need Gmail App Password, not regular password)');
      logger.warn('   3. 2FA not enabled on Gmail account');
      logger.warn('   4. "Less secure app access" might be disabled (use App Password instead)');
    }
    
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
