import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { createHttpResponse, createErrorResponse } from '../utils/http.js';

// Validation schemas
const answerSchema = z.object({
  email: z.string().email("Valid email is required"),
  questionId: z.union([z.string(), z.number()]).transform(val => String(val)), // Accept both string and number, convert to string
  optionKey: z.string().optional(),
  optionValue: z.any().optional()
}).refine(data => data.optionKey || data.optionValue, {
  message: "Either optionKey or optionValue must be provided",
  path: ["optionKey"]
});

const userRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters"),
  gender: z.enum(['male', 'female']).optional()
});

const finalizeSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().optional(),
  phone: z.string().optional()
  // answers excluded - we handle normalization separately
});

export class QuizController {
  constructor(quizService) {
    this.quizService = quizService;
  }

  async getQuiz(req, res) {
    try {
      const { quizId } = req.params;
      
      // Validate quizId
      if (!quizId || typeof quizId !== 'string') {
        return createErrorResponse(res, 400, 'Invalid quiz ID provided');
      }
      
      const quiz = await this.quizService.getQuizById(quizId);
      
      return createHttpResponse(res, 200, quiz);
    } catch (error) {
      logger.error('❌ Get quiz failed:', error);
      
      if (error.message.includes('not found')) {
        return createErrorResponse(res, 404, 'Quiz not found');
      }
      
      return createErrorResponse(res, 500, 'Failed to load quiz');
    }
  }
}

export class AttemptController {
  constructor(attemptService, scoringService, mailService, quizService) {
    this.attemptService = attemptService;
    this.scoringService = scoringService;
    this.mailService = mailService;
    this.quizService = quizService;
  }

  async registerUser(req, res) {
    // Route entry logs
    console.log("[ROUTE:ENTER]", req.method, req.originalUrl);
    res.on("finish", () => console.log("[ROUTE:EXIT ]", req.method, req.originalUrl, res.statusCode));
    
    // Performance timing and diagnostics
    console.time("[REGISTER] total");
    console.log("[REGISTER] enter", { url: req.originalUrl });
    res.on("finish", () => console.timeEnd("[REGISTER] total"));
    
    // Safe Mode guard
    if (process.env.SAFE_MODE === "1") {
      console.warn("[SAFE_MODE] Early-200 for", req.originalUrl);
      return res.status(200).json({ success: true, diag: "safe-mode-bypass", message: "User registered successfully (safe mode)" });
    }
    
    try {
      const { quizId } = req.params;
      const validatedData = userRegistrationSchema.parse(req.body);
      
      // Generate userId and credentials like IKSC Bandhan
      const firstName = validatedData.name.split(' ')[0] || 'User';
      const lastName = validatedData.name.split(' ').slice(1).join(' ') || 'Name';
      const firstNameLower = firstName.toLowerCase();
      const lastNameLower = lastName.toLowerCase();
      
      // Generate unique userName (no need to check for uniqueness in this simple case)
      const userName = `${firstNameLower}.${lastNameLower}@${Math.floor(1000 + Math.random() * 9000)}`;
      
      const password = `${firstNameLower}@${validatedData.phone.slice(0, 4)}`;
      const userId = `user_${validatedData.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      
      // Create or update user attempt with basic info
      const attempt = await this.attemptService.createOrUpdateUser({
        userId,
        quizId,
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        gender: validatedData.gender,
        userName,
        password
      });
      
      // Diagnostic early return if enabled
      if (process.env.DIAG_EARLY_200 === "1") {
        return res.status(200).json({ success: true, diag: "register-early-200" });
      }
      
      logger.info(`✅ User registered: ${validatedData.email}`);
      
      return res.status(200).json({
        success: true,
        message: 'User registered successfully',
        userId: userId,
        email: validatedData.email,
        userName
        // Password removed for security
      });
    } catch (error) {
      logger.error('❌ Registration failed:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to register user'
      });
    }
  }

  async saveAnswer(req, res) {
    try {
      const { quizId } = req.params;
      const validatedData = answerSchema.parse(req.body);
      
      logger.info(`📝 Saving answer for quiz ${quizId}, question ${validatedData.questionId}`);
      
      const result = await this.attemptService.saveAnswer({
        quizId,
        email: validatedData.email,
        questionId: validatedData.questionId,
        optionKey: validatedData.optionKey,
        optionValue: validatedData.optionValue
      });
      
      logger.info(`✅ Answer saved successfully for question ${validatedData.questionId}`);
      return createHttpResponse(res, 200, result);
    } catch (error) {
      logger.error('❌ Save answer failed:', error);
      
      if (error.name === 'ZodError') {
        logger.error('Validation errors:', error.errors);
        return createErrorResponse(res, 400, 'Validation failed', error.errors);
      }
      
      return createErrorResponse(res, 500, `Failed to save answer: ${error.message}`);
    }
  }

  async finalizeAttempt(req, res) {
    // Route entry logs
    console.log("[ROUTE:ENTER]", req.method, req.originalUrl);
    res.on("finish", () => console.log("[ROUTE:EXIT ]", req.method, req.originalUrl, res.statusCode));
    
    // Performance timing and diagnostics
    console.time("[FINALIZE] total");
    console.log("[FINALIZE] enter", { url: req.originalUrl, hasAnswers: !!req.body?.answers });
    res.on("finish", () => console.timeEnd("[FINALIZE] total"));
    
    try {
      logger.info('🚀 [START FINALIZE_ATTEMPT] - Starting quiz finalization process');
      
      const { quizId } = req.params;
      const { userId, email, name, phone } = req.body;
      
      // Validate required fields
      if (!userId || !quizId || !email || !name) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, quizId, email, name'
        });
      }
      
      // Normalize answers (accept legacy, store canonical)
      const rawAnswers = req.body?.answers;
      if (!Array.isArray(rawAnswers)) {
        return res.status(400).json({
          success: false,
          message: 'answers must be an array'
        });
      }
      
      const normalizedErrors = [];
      const normalizedAnswers = rawAnswers.map((a, idx) => {
        // Preferred format A: { questionId, selectedOption }
        if (a && (a.questionId ?? a.qId) && (a.selectedOption ?? a.option)) {
          return {
            questionId: String(a.questionId ?? a.qId), // Ensure string format
            selectedOption: String(a.selectedOption ?? a.option),
          };
        }
        
        // Legacy format B: { optionKey, optionValue, questionId?, qIndex? }
        if (a && (a.optionKey || a.optionValue)) {
          const qid = a.questionId ?? a.qIndex ?? (idx + 1);
          const sel = a.selectedOption ?? a.optionKey ?? a.optionValue;
          if (qid && sel) {
            return {
              questionId: String(qid), // Ensure string format
              selectedOption: String(sel),
            };
          }
        }
        
        normalizedErrors.push({
          index: idx,
          reason: "Missing questionId/selectedOption (or optionKey) fields"
        });
        return null;
      }).filter(Boolean); // Remove null entries
      
      if (normalizedErrors.length) {
        return res.status(422).json({
          success: false,
          message: "Invalid answers payload",
          details: normalizedErrors
        });
      }
      
      console.log("[FINALIZE] answers.in:", rawAnswers.length, "→ normalized:", normalizedAnswers.length);
      
      // Finalize sequence with instrumentation
      console.time("[FINALIZE] upsert");
      const result = await this.attemptService.finalizeAttempt({
        userId,
        quizId,
        email,
        name,
        phone,
        answers: normalizedAnswers
      });
      console.timeEnd("[FINALIZE] upsert");
      
      console.time("[FINALIZE] score");
      const score = result.score || 0;
      console.timeEnd("[FINALIZE] score");
      
      console.time("[FINALIZE] persist");
      // Score is already persisted by the service
      console.timeEnd("[FINALIZE] persist");
      
      // Create result record
      console.time("[FINALIZE] result");
      const resultRecord = await this.attemptService.createResult({
        quizId,
        userId,
        email,
        name,
        phone,
        summary: { score, topCategory: 'General' }, // TODO: Calculate real summary
        raw: { answers: normalizedAnswers, score },
        attemptId: result.attempt._id
      });
      console.timeEnd("[FINALIZE] result");
      
      // Queue emails (non-blocking)
      console.log("[FINALIZE] emails -> user+owner (queued)");
      this.queueWelcomeToUser({ to: email, name, quizId, score });
      this.queueOwnerNotification({ student: { email, name, quizId, score } });
      
      return res.status(200).json({
        success: true,
        userId,
        quizId,
        score
      });
    } catch (error) {
      console.error("🚨 [FINALIZE ERROR] Full error details:", error);
      console.error("🚨 [FINALIZE ERROR] Stack trace:", error.stack);
      console.error("🚨 [FINALIZE ERROR] Error name:", error.name);
      console.error("🚨 [FINALIZE ERROR] Error message:", error.message);
      return res.status(500).json({
        success: false,
        message: "Finalize failed: " + (error.message || error),
        code: "E_FINALIZE_STEP_X",
        details: error.stack
      });
    }
  }

  // Email queue methods (non-blocking)
  queueWelcomeToUser({ to, name, quizId, score }) {
    this.mailService.sendWelcome({
      to,
      name,
      summary: { score },
      userName: name?.toLowerCase().replace(/\s+/g, '.') + '@' + Math.floor(1000 + Math.random() * 9000),
      password: 'hidden',
      quizId: quizId // Pass quizId for dynamic email content
    }).then(info => {
      console.log("[MAIL][USER] sent", info?.messageId);
    }).catch(e => {
      console.error("[MAIL][USER] err", e?.message || e);
    });
  }

  queueOwnerNotification({ student }) {
    this.mailService.sendOwnerNotification({
      to: process.env.OWNER_EMAIL,
      student
    }).then(info => {
      console.log("[MAIL][OWNER] sent", info?.messageId);
    }).catch(e => {
      console.error("[MAIL][OWNER] err", e?.message || e);
    });
  }

  // Get results by email
  async getResultsByEmail(req, res) {
    try {
      const { email, quizId } = req.query;
      
      if (!email || !quizId) {
        return res.status(400).json({
          success: false,
          message: 'Email and quizId are required'
        });
      }

      console.log(`🔍 [RESULTS] Looking up results for email: ${email}, quizId: ${quizId}`);
      
      // Get the appropriate models based on quizId
      const resultModel = this.attemptService.modelFactory.getResultModel(quizId);
      
      // Find result by email and quizId
      const result = await resultModel.findOne({ email, quizId }).sort({ createdAt: -1 });
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Results not found for this email and quiz type'
        });
      }

      console.log(`✅ [RESULTS] Found results for email: ${email}`);
      
      return res.status(200).json({
        success: true,
        data: {
          quizId: result.quizId,
          name: result.name,
          email: result.email,
          summary: result.summary,
          raw: result.raw,
          completedAt: result.createdAt
        }
      });
      
    } catch (error) {
      console.error("🚨 [RESULTS ERROR] Full error details:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve results: " + (error.message || error),
        code: "E_RESULTS_LOOKUP_FAILED"
      });
    }
  }
}