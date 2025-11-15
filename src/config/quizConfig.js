// Quiz configuration for dynamic email templates
export const QUIZ_CONFIGS = {
  'divorce': {
    category: 'Divorce Conflict Resolution',
    shortName: 'Conflict Resolution',
    description: 'Understanding relationship dynamics and communication patterns',
    color: '#8b5cf6', // Purple
    emoji: '💔',
    branding: 'Divorce Conflict Resolution',
    landingUrl: null, // No explore button for divorce
    emailButtonUrl: 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email'
  },
  'happiness-index': {
    category: 'Marriage Happiness Index',
    shortName: 'Happiness Index', 
    description: 'Assessing relationship satisfaction and happiness levels',
    color: '#f59e0b', // Amber
    emoji: '😊',
    branding: 'Marriage Happiness Index',
    landingUrl: 'https://happiness-index-landing.ikscbandhan.in',
    emailButtonUrl: 'https://marriage-happiness-index.ikscbandhan.in/happiness-index-email'
  },
  'pre-marriage-preparation': {
    category: 'Pre-Marriage Preparation',
    shortName: 'Pre-Marriage Prep',
    description: 'Preparing for a successful marriage journey',
    color: '#10b981', // Emerald
    emoji: '💍',
    branding: 'Pre-Marriage Preparation',
    landingUrl: 'https://pre-marriage-preparation-landing.ikscbandhan.in',
    emailButtonUrl: 'https://pre-marriage-preparation.ikscbandhan.in/bandhan-email'
  },
  'pre-marriage-compatibility': {
    category: 'Pre-Marriage Compatibility',
    shortName: 'Compatibility',
    description: 'Understanding relationship compatibility and alignment',
    color: '#3b82f6', // Blue
    emoji: '💕',
    branding: 'Pre-Marriage Compatibility',
    landingUrl: 'https://pre-marriage-compatibility-landing.ikscbandhan.in',
    emailButtonUrl: 'https://pre-marriage-compatibility.ikscbandhan.in/pre-marriage-compatibility-email'
  },
  'senior': {
    category: 'Senior Citizen Life',
    shortName: 'Senior Life',
    description: 'Life assessment and guidance for senior citizens',
    color: '#6b7280', // Gray
    emoji: '👴',
    branding: 'Senior Citizen Life',
    landingUrl: 'https://wisdom-landing.ikscbandhan.in',
    emailButtonUrl: 'https://wisdom-seniors.ikscbandhan.in/wisdom-seniors-email'
  },
  'unemployed': {
    category: 'Career Guidance',
    shortName: 'Career Guidance',
    description: 'Career direction and professional development',
    color: '#ef4444', // Red
    emoji: '💼',
    branding: 'Career Guidance',
    landingUrl: 'https://professional-landing.ikscbandhan.in',
    emailButtonUrl: 'https://career-compass-working-professional.ikscbandhan.in/unemployed-email'
  },
  'working-professionals': {
    category: 'Professional Development',
    shortName: 'Professional Development',
    description: 'Career advancement and professional growth',
    color: '#8b5cf6', // Purple
    emoji: '🚀',
    branding: 'Professional Development',
    landingUrl: 'https://professional-landing.ikscbandhan.in',
    emailButtonUrl: 'https://career-compass-working-professional.ikscbandhan.in/working-professional-email'
  },
  'school-students': {
    category: 'Career Compass School',
    shortName: 'Career Compass',
    description: 'Career guidance for school and college students',
    color: '#06b6d4', // Cyan
    emoji: '🎓',
    branding: 'Career Compass School',
    landingUrl: 'https://school-student-landing.ikscbandhan.in',
    emailButtonUrl: 'https://career-compass-school-collage.ikscbandhan.in/school-student-email'
  },
  'industry': {
    category: 'Industry Assessment',
    shortName: 'Industry',
    description: 'Industry-specific career assessment',
    color: '#6366f1', // Indigo
    emoji: '🏭',
    branding: 'Industry Assessment',
    landingUrl: 'https://industry-landing.ikscbandhan.in',
    emailButtonUrl: 'https://industry.ikscbandhan.in/industry-email'
  },
  'career-graduation': {
    category: 'Career Compass Graduation',
    shortName: 'Career Compass',
    description: 'Career guidance for graduates',
    color: '#f59e0b', // Amber
    emoji: '🎓',
    branding: 'Career Compass Graduation',
    landingUrl: 'https://happiness-index-landing.ikscbandhan.in',
    emailButtonUrl: 'https://career-compass-graduation.ikscbandhan.in/graduation-email'
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
    quizType = 'school-students';
  } else if (quizId?.includes('career_working') || quizId?.includes('working_professional')) {
    quizType = 'working-professionals';
  } else if (quizId?.includes('industry')) {
    quizType = 'industry';
  } else if (quizId?.includes('career_graduation') || quizId?.includes('graduation')) {
    quizType = 'career-graduation';
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🎯 Quiz ID: ${quizId} -> Quiz Type: ${quizType}`);
  }
  return QUIZ_CONFIGS[quizType] || DEFAULT_QUIZ_CONFIG;
};

// Get landing page URL for Explore button
export const getLandingPageUrl = (quizId) => {
  const config = getQuizConfig(quizId);
  return config.landingUrl || null;
};

// Get email button URL for email template
export const getEmailButtonUrl = (quizId) => {
  const config = getQuizConfig(quizId);
  return config.emailButtonUrl || `${process.env.BRAND_SITE || 'https://www.ikscbandhan.in'}/results?quiz=${encodeURIComponent(quizId)}`;
};
