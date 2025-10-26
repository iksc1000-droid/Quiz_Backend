import { logger } from '../utils/logger.js';

export class ScoringService {
  calculateScore(answers, scoringFramework) {
    try {
      const { method, categories } = scoringFramework;
      
      if (method === 'categorical_sum') {
        return this.calculateCategoricalSum(answers, categories);
      }
      
      throw new Error(`Unsupported scoring method: ${method}`);
    } catch (error) {
      logger.error('❌ Scoring calculation failed:', error);
      throw error;
    }
  }

  calculateCategoricalSum(answers, categories) {
    // Validate answers parameter
    if (!answers || !Array.isArray(answers) || !answers.length) {
      logger.warn('⚠️ [SCORING] - No answers provided for scoring, returning default scores');
      return {
        categories: {},
        topCategory: 'General',
        methodUsed: 'default'
      };
    }
    
    const categoryScores = {};
    let hasWeightMapping = false;
    
    // Initialize category scores
    Object.keys(categories).forEach(category => {
      categoryScores[category] = 0;
    });
    
    logger.info(`📊 [SCORING] - Calculating scores for ${answers.length} answers`);
    
    // Calculate scores
    answers.forEach(answer => {
      const questionId = answer.questionId;
      
      // Find which category this question belongs to
      Object.entries(categories).forEach(([categoryName, questionIds]) => {
        if (questionIds.includes(questionId)) {
          // Check if question has weight mapping
          if (answer.weightMapping) {
            hasWeightMapping = true;
            const weight = answer.weightMapping[answer.optionKey] || 1;
            categoryScores[categoryName] += weight;
          } else {
            // Simple count (each answer = 1 point)
            categoryScores[categoryName] += 1;
          }
        }
      });
    });
    
    // Find top category
    const topCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    logger.info(`✅ [SCORING] - Scoring complete. Top category: ${topCategory}`);
    
    return {
      categories: categoryScores,
      topCategory,
      methodUsed: hasWeightMapping ? 'weighted_sum' : 'categorical_sum'
    };
  }
}
