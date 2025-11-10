import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { createQuizRoutes } from './routes/quiz.routes.js';
import { AttemptController } from './controllers/quiz.controller.js';

export const createApp = (quizService, attemptService, scoringService, mailService) => {
  const app = express();

  // ---- MIDDLEWARE PROFILER (TEMP) ----
  if (process.env.DIAG_PROFILER === '1') {
    function wrapMw(fn, label) {
      return function wrapped(req, res, next) {
        const start = process.hrtime.bigint();
        const id = `${label} ${req.method} ${req.originalUrl}`;
        console.log("[MW:ENTER]", id);
        let finished = false;
        const done = () => {
          if (finished) return;
          finished = true;
          const dur = Number(process.hrtime.bigint() - start) / 1e6;
          console.log("[MW:EXIT ]", id, `${dur.toFixed(1)}ms`);
        };
        res.once("finish", done);
        res.once("close", done);
        try {
          const maybe = fn(req, res, (...args) => {
            console.log("[MW:NEXT ]", id);
            next(...args);
          });
          // If middleware returns a promise, observe rejections
          if (maybe && typeof maybe.then === "function") {
            maybe.catch(err => {
              console.error("[MW:ERR  ]", id, err?.message || err);
              next(err);
            });
          }
        } catch (e) {
          console.error("[MW:THROW]", id, e?.message || e);
          next(e);
        }
      }
    }

    // helper to register with labels
    function useL(label, mw) { app.use(wrapMw(mw, label)); }
    
    // Store the profiler functions on app for later use
    app._useL = useL;
    app._wrapMw = wrapMw;
  } else {
    // No-op functions when profiler is disabled
    app._useL = (label, mw) => app.use(mw);
    app._wrapMw = (fn, label) => fn;
  }
  // ---- END PROFILER ----

  // Security middleware
  app._useL("helmet", helmet());
  
  // CORS - Production-ready configuration
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];
  
  app._useL("cors", cors({ 
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
  }));
  
  // Request logging with morgan
  app._useL("morgan", morgan(":method :url :status - :response-time ms"));
  
  // Additional request logging for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      logger.info(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
      next();
    });
  }

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  app._useL("ratelimit", limiter);

  // Body parsing
  app._useL("json", express.json({ limit: '10mb' }));
  app._useL("urlencoded", express.urlencoded({ extended: true }));

  // Serve static files from public directory
  app._useL("static", express.static('public'));

  // Preflight handled by CORS middleware automatically

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Test endpoint for frontend connection
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Backend is working!', 
      timestamp: new Date().toISOString(),
      cors: 'enabled'
    });
  });

  // Results page route
  app.get('/results', (req, res) => {
    res.sendFile('results.html', { root: 'public' });
  });

  // Diagnostic endpoints for reachability proof
  app.get('/diag/ping', (req, res) => res.json({ ok: true, time: Date.now() }));
  app.post('/diag/echo', (req, res) => res.json({ ok: true, len: JSON.stringify(req.body || {}).length }));

  // Stack dump endpoint for debugging
  if (process.env.DIAG_PROFILER === '1') {
    app.get('/__stack', (req, res) => {
      const stack = app._router?.stack?.map((l, i) => ({
        i,
        name: l?.name || "<anonymous>",
        path: l?.route?.path || l?.regexp?.toString() || "<mw>",
        methods: l?.route?.methods || {},
      })) || [];
      res.json({ stack });
    });
  }

  // Wrapper routes for frontend compatibility (legacy endpoints)
  // These routes forward to the proper /api/quizzes/:quizId endpoints
  const attemptController = new AttemptController(
    attemptService, 
    scoringService, 
    mailService, 
    quizService
  );

  // POST /register - Wrapper for /api/quizzes/:quizId/register
  app.post('/register', async (req, res) => {
    try {
      // Determine quizId from body or use default for divorce quiz
      const quizId = req.body.quizId || process.env.DEFAULT_QUIZ_ID || 'divorce_conflict_v1';
      
      // Create a new request object with quizId in params
      req.params = { quizId };
      
      // Call the actual register endpoint
      await attemptController.registerUser(req, res);
    } catch (error) {
      logger.error('❌ Register wrapper failed:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed: ' + (error.message || error)
      });
    }
  });

  // POST /result - Wrapper for /api/quizzes/:quizId/finalize
  app.post('/result', async (req, res) => {
    try {
      // Determine quizId from body or use default
      const quizId = req.body.quizId || process.env.DEFAULT_QUIZ_ID || 'divorce_conflict_v1';
      
      // Generate userId if not provided (for compatibility with frontend)
      if (!req.body.userId && req.body.email) {
        req.body.userId = `user_${req.body.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      }
      
      // Create a new request object with quizId in params
      req.params = { quizId };
      
      // Call the actual finalize endpoint
      await attemptController.finalizeAttempt(req, res);
    } catch (error) {
      logger.error('❌ Result wrapper failed:', error);
      res.status(500).json({
        success: false,
        message: 'Result submission failed: ' + (error.message || error)
      });
    }
  });

  // GET /user/:email - Get user results by email
  app.get('/user/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const quizId = req.query.quizId || process.env.DEFAULT_QUIZ_ID || 'divorce_conflict_v1';
      
      // Use the getResultsByEmail method
      req.query = { email, quizId };
      await attemptController.getResultsByEmail(req, res);
    } catch (error) {
      logger.error('❌ Get user data failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user data: ' + (error.message || error)
      });
    }
  });

  // API routes
  app.use('/api/quizzes', createQuizRoutes(quizService, attemptService, scoringService, mailService));

  // 404 handler
  app.use(notFound);

  // Error handler
  app.use(errorHandler);

  return app;
};
