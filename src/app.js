import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { createQuizRoutes } from './routes/quiz.routes.js';

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
  app._useL("cors", cors({ 
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
  }));
  
  // Request logging with morgan
  app._useL("morgan", morgan(":method :url :status - :response-time ms"));
  
  // Additional request logging for debugging
  app.use((req, res, next) => {
    console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
    next();
  });

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

  // API routes
  app.use('/api/quizzes', createQuizRoutes(quizService, attemptService, scoringService, mailService));

  // 404 handler
  app.use(notFound);

  // Error handler
  app.use(errorHandler);

  return app;
};
