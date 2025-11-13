import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { createHttpResponse, createErrorResponse } from '../utils/http.js';
import { getQuizConfig } from '../config/quizConfig.js';

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
      
      // Allow dynamic quiz creation - return mock structure if quiz doesn't exist in DB
      try {
        const quiz = await this.quizService.getQuizById(quizId);
        return createHttpResponse(res, 200, quiz);
      } catch (dbError) {
        if (dbError.message.includes('not found')) {
          logger.warn(`⚠️ Quiz ${quizId} not found in DB, returning mock structure`);
          // Return a generic quiz structure so the API doesn't fail
          return createHttpResponse(res, 200, {
            quizId,
            title: `Quiz ${quizId}`,
            description: 'Quiz data',
            questions: [],
            scoringFramework: {}
          });
        }
        throw dbError;
      }
    } catch (error) {
      logger.error('❌ Get quiz failed:', error);
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
    // Route entry logs (development only)
    if (process.env.NODE_ENV !== 'production') {
      logger.debug("[ROUTE:ENTER]", req.method, req.originalUrl);
      res.on("finish", () => logger.debug("[ROUTE:EXIT ]", req.method, req.originalUrl, res.statusCode));
      
      // Performance timing and diagnostics
      console.time("[REGISTER] total");
      logger.debug("[REGISTER] enter", { url: req.originalUrl });
      res.on("finish", () => console.timeEnd("[REGISTER] total"));
    }
    
    // Safe Mode guard
    if (process.env.SAFE_MODE === "1") {
      logger.warn("[SAFE_MODE] Early-200 for", req.originalUrl);
      return res.status(200).json({ success: true, diag: "safe-mode-bypass", message: "User registered successfully (safe mode)" });
    }
    
    try {
      const { quizId } = req.params;
      const validatedData = userRegistrationSchema.parse(req.body);
      
      // Check if user has already completed the quiz
      const existingAttempt = await this.attemptService.findUserByEmail(validatedData.email, quizId);
      const lockedStatuses = ['submitted', 'finalizing', 'completed'];
      if (existingAttempt && lockedStatuses.includes(existingAttempt.status)) {
        logger.warn(`⚠️  Duplicate registration attempt for completed quiz by ${validatedData.email}`);
        return res.status(409).json({
          success: false,
          message: 'You have already completed this assessment. Please check your email for the result or try with another email address.'
        });
      }
      
      // Generate userId (no username/password needed)
      const userId = `user_${validatedData.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      
      // Create or update user attempt with basic info (preserves existing data)
      await this.attemptService.createOrUpdateUser({
        userId,
        quizId,
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        gender: validatedData.gender
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
        email: validatedData.email
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
    // Route entry logs (development only)
    if (process.env.NODE_ENV !== 'production') {
      logger.debug("[ROUTE:ENTER]", req.method, req.originalUrl);
      res.on("finish", () => logger.debug("[ROUTE:EXIT ]", req.method, req.originalUrl, res.statusCode));
      
      // Performance timing and diagnostics
      console.time("[FINALIZE] total");
      logger.debug("[FINALIZE] enter", { url: req.originalUrl, hasAnswers: !!req.body?.answers });
      res.on("finish", () => console.timeEnd("[FINALIZE] total"));
    }
    
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
      
      if (process.env.NODE_ENV !== 'production') {
        logger.debug("[FINALIZE] answers.in:", rawAnswers.length, "→ normalized:", normalizedAnswers.length);
      }
      
      // Finalize sequence with instrumentation (development only)
      if (process.env.NODE_ENV !== 'production') {
        console.time("[FINALIZE] upsert");
      }
      const result = await this.attemptService.finalizeAttempt({
        userId,
        quizId,
        email,
        name,
        phone,
        answers: normalizedAnswers
      });
      if (process.env.NODE_ENV !== 'production') {
        console.timeEnd("[FINALIZE] upsert");
        console.time("[FINALIZE] score");
      }
      const score = result.score || 0;
      if (process.env.NODE_ENV !== 'production') {
        console.timeEnd("[FINALIZE] score");
        console.time("[FINALIZE] persist");
      }
      // Score is already persisted by the service
      if (process.env.NODE_ENV !== 'production') {
        console.timeEnd("[FINALIZE] persist");
        console.time("[FINALIZE] result");
      }
      
      // Calculate topCategory from quiz answers
      let topCategory = 'General';
      try {
        // Calculate category scores based on quiz type
        if (quizId === 'divorce_conflict_v1') {
          // For divorce conflict quiz, calculate parameter scores
          const parameterScores = {
            'A': 0, // Partner Understanding
            'B': 0, // Communication Issues
            'C': 0, // Conflict Patterns
            'D': 0, // Family Dynamics
            'E': 0, // Emotional Distance
            'F': 0  // Trust Issues
          };
          
          // Count answers for each parameter
          normalizedAnswers.forEach(answer => {
            const category = answer.questionId?.charAt(0);
            if (parameterScores.hasOwnProperty(category)) {
              // Score based on selected option (a=0, b=1, c=2, d=3)
              const option = answer.selectedOption?.charAt(answer.selectedOption.length - 1);
              const optionScore = option === 'a' ? 0 : option === 'b' ? 1 : option === 'c' ? 2 : 3;
              parameterScores[category] += optionScore;
            }
          });
          
          // Find top category
          const categoryNames = {
            'A': 'Partner Understanding',
            'B': 'Communication Issues',
            'C': 'Conflict Patterns',
            'D': 'Family Dynamics',
            'E': 'Emotional Distance',
            'F': 'Trust Issues'
          };
          
          const sortedCategories = Object.entries(parameterScores)
            .sort(([, a], [, b]) => b - a);
          
          if (sortedCategories.length > 0) {
            topCategory = categoryNames[sortedCategories[0][0]] || 'General';
          }
        } else {
          const quizConfig = getQuizConfig(quizId);
          topCategory = quizConfig.category || 'General';
        }
      } catch (error) {
        logger.warn('⚠️ Failed to calculate topCategory, using default:', error.message);
        // Fallback to quiz config category
        try {
          const quizConfig = getQuizConfig(quizId);
          topCategory = quizConfig.category || 'General';
        } catch (e) {
          topCategory = 'General';
        }
      }
      
      // Get updated name from attempt (in case it was updated during finalization)
      const updatedName = result.attempt.name || name;
      const updatedPhone = result.attempt.phone || phone;
      
      // Create result record with updated name
      const resultRecord = await this.attemptService.createResult({
        quizId,
        userId,
        email,
        name: updatedName, // Use name from attempt (may have been updated)
        phone: updatedPhone, // Use phone from attempt (may have been updated)
        summary: { score, topCategory }, // Use calculated topCategory
        raw: { answers: normalizedAnswers, score },
        attemptId: result.attempt._id
      });
      if (process.env.NODE_ENV !== 'production') {
        console.timeEnd("[FINALIZE] result");
      }
      
      // Send emails (non-blocking but with proper error handling)
      logger.info("[FINALIZE] emails -> user+owner (sending)");
      
      // Send welcome email to user (critical - user must receive email)
      this.queueWelcomeToUser({ to: email, name, quizId, score })
        .then(info => {
          if (info && info.messageId) {
            logger.info(`[FINALIZE] ✅ User email sent successfully to ${email}`);
          } else {
            logger.warn(`[FINALIZE] ⚠️  User email may not have been sent to ${email}`);
          }
        })
        .catch(err => {
          logger.error(`[FINALIZE] ❌ CRITICAL: Failed to send email to user ${email}`);
          logger.error(`[FINALIZE] Error: ${err.message || err}`);
          // Log but don't break the response - user already got their results
        });
      
      // Send owner notification (non-critical, failures are acceptable)
      this.queueOwnerNotification({ student: { email, name, quizId, score } })
        .then(info => {
          if (info && info.messageId) {
            logger.info(`[FINALIZE] ✅ Owner notification sent successfully`);
          }
        })
        .catch(err => {
          logger.warn(`[FINALIZE] ⚠️  Owner notification failed (non-critical): ${err.message || err}`);
        });
      
      return res.status(200).json({
        success: true,
        userId,
        quizId,
        score
      });
    } catch (error) {
      logger.error("🚨 [FINALIZE ERROR] Full error details:", error);
      if (process.env.NODE_ENV !== 'production') {
        logger.error("🚨 [FINALIZE ERROR] Stack trace:", error.stack);
        logger.error("🚨 [FINALIZE ERROR] Error name:", error.name);
      }
      logger.error("🚨 [FINALIZE ERROR] Error message:", error.message);
      return res.status(500).json({
        success: false,
        message: "Finalize failed: " + (error.message || error),
        code: "E_FINALIZE_STEP_X",
        details: error.stack
      });
    }
  }

  // Email queue methods (non-blocking)
  async queueWelcomeToUser({ to, name, quizId, score }) {
    logger.info(`[MAIL][USER] 📧 Preparing to send welcome email to: ${to}`);
    
    // Get result to include topCategory in email
    let topCategory = 'General';
    try {
      const resultModel = this.modelFactory.getResultModel(quizId);
      const latestResult = await resultModel.findOne({ email: to, quizId }).sort({ createdAt: -1 });
      if (latestResult?.summary?.topCategory) {
        topCategory = latestResult.summary.topCategory;
      }
    } catch (error) {
      logger.warn(`[MAIL][USER] Could not fetch topCategory for email: ${error.message}`);
    }
    
    return this.mailService.sendWelcome({
      to,
      name,
      summary: { score, topCategory }, // Include calculated topCategory
      quizId: quizId // Pass quizId for dynamic email content
    }).then(info => {
      // Success case - email was sent
      if (info && info.messageId) {
        logger.info(`[MAIL][USER] ✅ Email sent successfully to ${to}`);
        logger.info(`[MAIL][USER] Message ID: ${info.messageId}`);
        return info;
      } else {
        // This shouldn't happen if error handling is correct, but handle it anyway
        const error = new Error('Email function returned without messageId - email may not have been delivered');
        logger.error(`[MAIL][USER] ❌ ${error.message}`);
        throw error;
      }
    }).catch(e => {
      // Error case - email failed to send
      const errorMessage = e?.message || 'Unknown error occurred';
      logger.error(`[MAIL][USER] ❌ FAILED to send email to ${to}`);
      logger.error(`[MAIL][USER] Error: ${errorMessage}`);
      
      // Log additional context for debugging
      if (e?.code) {
        logger.error(`[MAIL][USER] Error code: ${e.code}`);
      }
      if (e?.responseCode) {
        logger.error(`[MAIL][USER] Response code: ${e.responseCode}`);
      }
      
      // Re-throw with clear message
      throw new Error(`Email sending failed for ${to}: ${errorMessage}`);
    });
  }

  queueOwnerNotification({ student }) {
    logger.info(`[MAIL][OWNER] Attempting to send owner notification for: ${student.email}`);
    return this.mailService.sendOwnerNotification({
      to: process.env.OWNER_EMAIL,
      student
    }).then(info => {
      if (info && info.messageId) {
        logger.info(`[MAIL][OWNER] ✅ Notification sent successfully, messageId: ${info.messageId}`);
      } else {
        logger.warn(`[MAIL][OWNER] ⚠️ Notification function returned but no messageId`);
      }
      return info;
    }).catch(e => {
      logger.error(`[MAIL][OWNER] ❌ Failed to send owner notification:`, e?.message || e);
      logger.error(`[MAIL][OWNER] Error details:`, {
        message: e?.message,
        code: e?.code,
        stack: e?.stack
      });
      throw e; // Re-throw so caller knows it failed
    });
  }

  // Get results by email
  async getResultsByEmail(req, res) {
    try {
      const rawEmail =
        req.query?.email ??
        req.parsedQuery?.email ??
        req.params?.email ??
        '';

      const rawQuizId =
        req.query?.quizId ??
        req.parsedQuery?.quizId ??
        process.env.DEFAULT_QUIZ_ID ??
        'divorce_conflict_v1';

      const email = String(rawEmail || '').trim();
      const quizId = String(rawQuizId || '').trim();
      
      if (!email || !quizId) {
        return res.status(400).json({
          success: false,
          message: 'Email and quizId are required'
        });
      }

      // Normalize email and quizId
      const normalizedEmail = email.toLowerCase();
      const normalizedQuizId = quizId.trim().replace(/\s+/g, '_');

      logger.info(`🔍 [RESULTS] Looking up results for email: ${normalizedEmail}, quizId: ${normalizedQuizId}`);
      logger.info(`🔍 [RESULTS] Raw email from query: ${email}, Raw quizId: ${quizId}`);
      
      try {
        // Get the appropriate models based on quizId
        logger.info(`🔍 [RESULTS] Getting model for quizId: ${normalizedQuizId}`);
        const resultModel = this.attemptService.modelFactory.getResultModel(normalizedQuizId);
        logger.info(`✅ [RESULTS] Model obtained successfully`);
        
        // Get collection name for debugging (safely)
        let collectionName = 'unknown';
        try {
          collectionName = resultModel.collection?.name || resultModel.modelName || 'unknown';
        } catch (e) {
          // Collection not accessible yet, that's okay
        }
        logger.info(`🔍 [RESULTS] Querying collection: ${collectionName}`);
        
        // Try multiple query strategies
        let result = null;
        
        // Strategy 1: Exact lowercase match
        try {
          result = await resultModel.findOne({ 
            email: normalizedEmail, 
            quizId: normalizedQuizId 
          }).sort({ createdAt: -1 }).lean();
          if (result) logger.info(`✅ [RESULTS] Found with exact lowercase match`);
        } catch (err) {
          logger.warn(`⚠️  [RESULTS] Exact match query failed:`, err.message);
        }
        
        // Strategy 2: Original email (as stored)
        if (!result) {
          try {
            result = await resultModel.findOne({ 
              email: email.trim(), 
              quizId: normalizedQuizId 
            }).sort({ createdAt: -1 }).lean();
            if (result) logger.info(`✅ [RESULTS] Found with original email match`);
          } catch (err) {
            logger.warn(`⚠️  [RESULTS] Original email query failed:`, err.message);
          }
        }
        
        // Strategy 3: Case-insensitive regex (fallback)
        if (!result) {
          try {
            const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = await resultModel.findOne({ 
              email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }, 
              quizId: normalizedQuizId 
            }).sort({ createdAt: -1 }).lean();
            if (result) logger.info(`✅ [RESULTS] Found with regex match`);
          } catch (err) {
            logger.warn(`⚠️  [RESULTS] Regex query failed:`, err.message);
          }
        }
        
        // Strategy 4: Just by quizId (last resort - get most recent)
        if (!result) {
          try {
            logger.warn(`⚠️  [RESULTS] Trying to find any result for quizId: ${normalizedQuizId}`);
            const allResults = await resultModel.find({ quizId: normalizedQuizId })
              .sort({ createdAt: -1 })
              .limit(5)
              .lean();
            logger.info(`🔍 [RESULTS] Found ${allResults.length} results for quizId, checking emails...`);
            for (const r of allResults) {
              if (r.email && r.email.toLowerCase() === normalizedEmail) {
                result = r;
                logger.info(`✅ [RESULTS] Found match in results list`);
                break;
              }
            }
          } catch (err) {
            logger.error(`❌ [RESULTS] Fallback query failed:`, err.message);
          }
        }
        
        if (!result) {
          logger.warn(`⚠️  [RESULTS] No results found after all strategies`);
          logger.warn(`⚠️  [RESULTS] Searched for email: ${normalizedEmail} (original: ${email}), quizId: ${normalizedQuizId}`);
          return res.status(404).json({
            success: false,
            message: 'Results not found for this email and quiz type'
          });
        }

        logger.info(`✅ [RESULTS] Found results for email: ${result.email || normalizedEmail}`);
        
        return res.status(200).json({
          success: true,
          data: {
            quizId: result.quizId,
            name: result.name,
            email: result.email,
            summary: result.summary,
            raw: result.raw,
            completedAt: result.createdAt,
            resultToken: result.resultToken
          }
        });
      } catch (dbError) {
        logger.error("🚨 [RESULTS DB ERROR]:", dbError);
        logger.error("🚨 [RESULTS DB ERROR] Message:", dbError.message);
        logger.error("🚨 [RESULTS DB ERROR] Name:", dbError.name);
        logger.error("🚨 [RESULTS DB ERROR] Stack:", dbError.stack);
        throw dbError;
      }
      
    } catch (error) {
      logger.error("🚨 [RESULTS ERROR] Full error details:", error);
      logger.error("🚨 [RESULTS ERROR] Error message:", error.message);
      logger.error("🚨 [RESULTS ERROR] Error stack:", error.stack);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve results: " + (error.message || error),
        code: "E_RESULTS_LOOKUP_FAILED",
        details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }
}