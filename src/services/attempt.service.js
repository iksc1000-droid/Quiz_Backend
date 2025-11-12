import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export class AttemptService {
  constructor(modelFactory) {
    this.modelFactory = modelFactory;
  }

  async createOrUpdateUser({ userId, quizId, email, name, phone, gender, userName, password }) {
    try {
      const attemptModel = this.modelFactory.getAttemptModel(quizId);
      
      // Check if user already exists
      let attempt = await attemptModel.findOne({ email, quizId });
      
      if (attempt) {
        // Update existing user
        attempt.userId = userId;
        attempt.name = name;
        attempt.phone = phone;
        attempt.gender = gender;
        attempt.userName = userName;
        attempt.password = password;
        await attempt.save();
        logger.info(`✅ User updated: ${email}`);
      } else {
        // Create new user
        attempt = new attemptModel({
          userId,
          quizId,
          email,
          name,
          phone,
          gender,
          userName,
          password,
          status: 'in_progress',
          answers: []
        });
        await attempt.save();
        logger.info(`✅ User created: ${email}`);
      }
      
      return attempt;
    } catch (error) {
      logger.error('❌ Failed to create/update user:', error);
      throw error;
    }
  }

  async findUserByEmail(email, quizId) {
    try {
      console.log("[DB:QUERY] findUserByEmail", { email, quizId });
      const attemptModel = this.modelFactory.getAttemptModel(quizId);
      const attempt = await attemptModel.findOne({ email, quizId }).maxTimeMS(5000);
      console.log("[DB:RESULT] findUserByEmail", { found: !!attempt });
      return attempt;
    } catch (error) {
      console.error("[DB:ERROR] findUserByEmail", error);
      logger.error('❌ Failed to find user by email:', error);
      // Return null instead of throwing to prevent infinite loop
      return null;
    }
  }

  async saveAnswer({ quizId, email, questionId, optionKey, optionValue }) {
    try {
      logger.info(`🔍 Looking for user attempt: email=${email}, quizId=${quizId}`);
      
      const attemptModel = this.modelFactory.getAttemptModel(quizId);
      
      // Find user by email first - try both in_progress and any status
      let attempt = await attemptModel.findOne({ email, quizId, status: 'in_progress' });
      
      if (!attempt) {
        // Try to find any attempt for this user
        attempt = await attemptModel.findOne({ email, quizId });
        if (attempt) {
          logger.info(`📝 Found existing attempt with status: ${attempt.status}`);
        }
      }
      
      if (!attempt) {
        logger.error(`❌ No attempt found for email: ${email}, quizId: ${quizId}`);
        throw new Error(`User attempt not found for email ${email}. Please register first.`);
      }
      
      // Ensure questionId is string for comparison
      const questionIdStr = String(questionId);
      logger.info(`📝 Processing answer for question: ${questionIdStr}`);
      
      // Update existing attempt
      const answerIndex = attempt.answers.findIndex(a => String(a.questionId) === questionIdStr);
      const newAnswer = { 
        questionId: questionIdStr, // Store as string
        optionKey: optionKey || '', 
        optionValue: optionValue || ''
      };
      
      if (answerIndex >= 0) {
        // Replace existing answer
        attempt.answers[answerIndex] = newAnswer;
        logger.info(`🔄 Replaced existing answer for question ${questionIdStr}`);
      } else {
        // Add new answer
        attempt.answers.push(newAnswer);
        logger.info(`➕ Added new answer for question ${questionIdStr}`);
      }
      
      await attempt.save();
      logger.info(`✅ Answer saved for user ${email}, question ${questionIdStr}`);
      return { success: true, message: 'Answer saved successfully' };
    } catch (error) {
      logger.error('❌ Failed to save answer:', error);
      logger.error('Error details:', error.message);
      throw error;
    }
  }

  async savePartialAnswer({ userId, quizId, questionId, optionKey, optionValue }) {
    try {
      const attemptModel = this.modelFactory.getAttemptModel(quizId);
      
      // Ensure questionId is string
      const questionIdStr = String(questionId);
      
      // First, try to find existing attempt
      let attempt = await attemptModel.findOne({ userId, quizId, status: 'in_progress' });
      
      if (attempt) {
        // Update existing attempt
        const answerIndex = attempt.answers.findIndex(a => String(a.questionId) === questionIdStr);
        const newAnswer = { 
          questionId: questionIdStr, // Store as string
          optionKey, 
          optionValue 
        };
        
        if (answerIndex >= 0) {
          // Replace existing answer
          attempt.answers[answerIndex] = newAnswer;
        } else {
          // Add new answer
          attempt.answers.push(newAnswer);
        }
        
        await attempt.save();
      } else {
        // Create new attempt
        attempt = new attemptModel({
          userId,
          quizId,
          status: 'in_progress',
          answers: [{ 
            questionId: questionIdStr, // Store as string
            optionKey, 
            optionValue 
          }]
        });
        
        await attempt.save();
      }

      logger.info(`✅ Partial answer saved for user ${userId}, question ${questionIdStr}`);
      return attempt;
    } catch (error) {
      logger.error('❌ Failed to save partial answer:', error);
      throw error;
    }
  }

  async finalizeAttempt({ userId, quizId, email, name, phone, answers }) {
    try {
      // Defensive validation (post-normalization, but be safe)
      if (!answers || !Array.isArray(answers) || answers.some(a => !a?.questionId || !a?.selectedOption)) {
        throw new Error('normalize-failed: answers missing questionId/selectedOption');
      }
      
      logger.info(`📊 [FINALIZE_ATTEMPT] - Finalizing attempt for user ${userId} with ${answers.length} answers`);
      
      const attemptModel = this.modelFactory.getAttemptModel(quizId);
      
      // Convert normalized answers to backend schema for storage
      const storageAnswers = answers.map(answer => ({
        questionId: String(answer.questionId), // Ensure string format
        optionKey: String(answer.selectedOption),
        optionValue: String(answer.selectedOption),
        ts: new Date()
      }));
      
      // Calculate score (simplified for now)
      const score = answers.length * 10; // Simple scoring
      
      // Find attempt by email and quizId (more reliable than userId)
      let attempt = await attemptModel.findOne({ email, quizId });
      
      if (!attempt) {
        throw new Error(`User attempt not found for email ${email} and quizId ${quizId}`);
      }
      
      // Update attempt with answers and status
      attempt.answers = storageAnswers;
      attempt.status = 'finalizing';
      attempt.updatedAt = new Date();
      await attempt.save();

      // Update with score and completion
      attempt.score = score;
      attempt.status = 'completed';
      attempt.completedAt = new Date();
      await attempt.save();

      logger.info(`✅ [FINALIZE_ATTEMPT] - Attempt finalized successfully for user ${userId}`);
      return { score, updated: true, attempt };
    } catch (error) {
      console.error("🚨 [ATTEMPT SERVICE ERROR] Full error details:", error);
      console.error("🚨 [ATTEMPT SERVICE ERROR] Stack trace:", error.stack);
      console.error("🚨 [ATTEMPT SERVICE ERROR] Error name:", error.name);
      console.error("🚨 [ATTEMPT SERVICE ERROR] Error message:", error.message);
      logger.error('❌ [FINALIZE_ATTEMPT] - Failed to finalize attempt:', error);
      throw error;
    }
  }

  async createResult({ quizId, userId, email, name, phone, summary, raw, attemptId }) {
    try {
      const resultModel = this.modelFactory.getResultModel(quizId);
      
      // Check if result already exists for this attempt (prevent duplicates)
      const existingResult = await resultModel.findOne({ 
        email, 
        quizId, 
        attemptId 
      });
      
      if (existingResult) {
        logger.info(`ℹ️  Result already exists for attempt ${attemptId}, returning existing result`);
        return existingResult;
      }
      
      // Explicitly generate resultToken to ensure it's never null
      // Use multiple fallbacks for maximum reliability
      let resultToken;
      try {
        resultToken = new mongoose.Types.ObjectId().toString();
      } catch (tokenError) {
        // Fallback: Use timestamp + random string if ObjectId fails
        resultToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        logger.warn('⚠️  Used fallback token generation method');
      }
      
      // Validate token is not empty
      if (!resultToken || resultToken.trim() === '') {
        throw new Error('Failed to generate resultToken');
      }
      
      const result = new resultModel({
        quizId,
        userId,
        email,
        name,
        phone,
        summary,
        raw,
        attemptId,
        resultToken // Explicitly set to ensure it's never null
      });

      // Save with retry logic for duplicate key errors
      let savedResult;
      let retries = 3;
      while (retries > 0) {
        try {
          savedResult = await result.save();
          break;
        } catch (saveError) {
          // If duplicate key error, generate new token and retry
          if (saveError.code === 11000 && saveError.keyPattern?.resultToken) {
            retries--;
            if (retries > 0) {
              resultToken = new mongoose.Types.ObjectId().toString();
              result.resultToken = resultToken;
              logger.warn(`⚠️  Duplicate token detected, generating new token (${retries} retries left)`);
            } else {
              throw new Error('Failed to create result after multiple retries due to duplicate token');
            }
          } else {
            throw saveError;
          }
        }
      }

      logger.info(`✅ Result created for user ${userId} with token ${savedResult.resultToken}`);
      return savedResult;
    } catch (error) {
      logger.error('❌ Failed to create result:', error);
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        keyPattern: error.keyPattern,
        quizId,
        email,
        attemptId
      });
      throw error;
    }
  }

  async markAttendance({ quizId, email, userId, resultId }) {
    try {
      const attemptModel = this.modelFactory.getAttemptModel(quizId);
      
      const attendance = await attemptModel.findOneAndUpdate(
        { quizId, email },
        {
          $set: {
            quizId,
            email,
            userId,
            resultId,
            attendedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );

      logger.info(`✅ Attendance marked for ${email}`);
      return attendance;
    } catch (error) {
      logger.error('❌ Failed to mark attendance:', error);
      throw error;
    }
  }
}
