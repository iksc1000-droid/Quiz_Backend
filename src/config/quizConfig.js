// Quiz configuration for dynamic email templates
export const QUIZ_CONFIGS = {
  'divorce': {
    category: 'Divorce Conflict Resolution',
    shortName: 'Conflict Resolution',
    description: 'Understanding relationship dynamics and communication patterns',
    color: '#8b5cf6', // Purple
    emoji: '💔',
    branding: 'Divorce Conflict Resolution'
  },
  'happiness-index': {
    category: 'Marriage Happiness Index',
    shortName: 'Happiness Index', 
    description: 'Assessing relationship satisfaction and happiness levels',
    color: '#f59e0b', // Amber
    emoji: '😊',
    branding: 'Marriage Happiness Index'
  },
  'pre-marriage-preparation': {
    category: 'Pre-Marriage Preparation',
    shortName: 'Pre-Marriage Prep',
    description: 'Preparing for a successful marriage journey',
    color: '#10b981', // Emerald
    emoji: '💍',
    branding: 'Pre-Marriage Preparation'
  },
  'pre-marriage-compatibility': {
    category: 'Pre-Marriage Compatibility',
    shortName: 'Compatibility',
    description: 'Understanding relationship compatibility and alignment',
    color: '#3b82f6', // Blue
    emoji: '💕',
    branding: 'Pre-Marriage Compatibility'
  },
  'senior': {
    category: 'Senior Citizen Life',
    shortName: 'Senior Life',
    description: 'Life assessment and guidance for senior citizens',
    color: '#6b7280', // Gray
    emoji: '👴',
    branding: 'Senior Citizen Life'
  },
  'unemployed': {
    category: 'Career Guidance',
    shortName: 'Career Guidance',
    description: 'Career direction and professional development',
    color: '#ef4444', // Red
    emoji: '💼',
    branding: 'Career Guidance'
  },
  'working-professionals': {
    category: 'Professional Development',
    shortName: 'Professional Development',
    description: 'Career advancement and professional growth',
    color: '#8b5cf6', // Purple
    emoji: '🚀',
    branding: 'Professional Development'
  }
};

// Default fallback configuration
export const DEFAULT_QUIZ_CONFIG = {
  category: 'Personal Assessment',
  shortName: 'Assessment',
  description: 'Understanding your personality and potential',
  color: '#6b7280',
  emoji: '📊',
  branding: 'Personal Assessment'
};

// Get quiz configuration by quiz ID or type
export const getQuizConfig = (quizId) => {
  // Extract quiz type from quizId
  let quizType = 'working-professionals'; // default
  
  if (quizId?.includes('senior_citizen')) {
    quizType = 'senior';
  } else if (quizId?.includes('divorce_conflict')) {
    quizType = 'divorce';
  } else if (quizId?.includes('happiness_index')) {
    quizType = 'happiness-index';
  } else if (quizId?.includes('pre_marriage_prep')) {
    quizType = 'pre-marriage-preparation';
  } else if (quizId?.includes('pre_marriage_compat')) {
    quizType = 'pre-marriage-compatibility';
  } else if (quizId?.includes('unemployed_career')) {
    quizType = 'unemployed';
  } else if (quizId?.includes('career_school')) {
    quizType = 'working-professionals';
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🎯 Quiz ID: ${quizId} -> Quiz Type: ${quizType}`);
  }
  return QUIZ_CONFIGS[quizType] || DEFAULT_QUIZ_CONFIG;
};
