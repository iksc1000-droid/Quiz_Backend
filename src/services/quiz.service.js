import { logger } from '../utils/logger.js';
import { flattenQuiz } from '../utils/flattenQuiz.js';

export class QuizService {
  constructor(quizModel) {
    this.quizModel = quizModel;
  }

  async getQuizById(quizId) {
    try {
      const quiz = await this.quizModel.findOne({ quizId });
      if (!quiz) {
        throw new Error(`Quiz with ID ${quizId} not found`);
      }
      
      const flattened = flattenQuiz(quiz);
      logger.info(`✅ Quiz ${quizId} loaded with ${flattened.length} questions`);
      
      return {
        quizId: quiz.quizId,
        title: quiz.title,
        description: quiz.description,
        questions: flattened,
        scoringFramework: quiz.scoringFramework
      };
    } catch (error) {
      logger.error(`❌ Failed to load quiz ${quizId}:`, error);
      throw error;
    }
  }
}
