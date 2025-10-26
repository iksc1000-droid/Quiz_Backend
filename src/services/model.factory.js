import { getAttemptModel } from '../models/Attempt.js';
import { getResultModel } from '../models/Result.js';

export class ModelFactory {
  constructor(resultsConn) {
    this.resultsConn = resultsConn;
    this.modelCache = new Map(); // Cache models to avoid recreating
  }

  getAttemptModel(quizId) {
    const cacheKey = `attempt_${quizId}`;
    
    if (!this.modelCache.has(cacheKey)) {
      const model = getAttemptModel(this.resultsConn, quizId);
      this.modelCache.set(cacheKey, model);
      console.log(`📋 Created attempt model for quiz: ${quizId}`);
    }
    
    return this.modelCache.get(cacheKey);
  }

  getResultModel(quizId) {
    const cacheKey = `result_${quizId}`;
    
    if (!this.modelCache.has(cacheKey)) {
      const model = getResultModel(this.resultsConn, quizId);
      this.modelCache.set(cacheKey, model);
      console.log(`📋 Created result model for quiz: ${quizId}`);
    }
    
    return this.modelCache.get(cacheKey);
  }

  // Helper to get quiz type from token
  getQuizTypeFromToken(token) {
    if (!token) return null;
    
    // Token format: {quizType}_{userId}_{timestamp}_{random}
    // Example: senior_citizen_12345_20250115_abc123
    const parts = token.split('_');
    if (parts.length >= 4) {
      return parts[0] + '_' + parts[1]; // senior_citizen
    }
    
    return null;
  }

  // Get models by token
  getModelsByToken(token) {
    const quizType = this.getQuizTypeFromToken(token);
    if (!quizType) {
      throw new Error('Invalid token format');
    }
    
    const quizId = `${quizType}_v1`;
    return {
      attemptModel: this.getAttemptModel(quizId),
      resultModel: this.getResultModel(quizId)
    };
  }
}
