import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // Support multiple CORS origins (comma-separated). Fallback to common localhost dev ports
  corsOrigins: (process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean)) || [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  mongo: {
    sourceUri: process.env.MONGO_URI_SOURCE,
    resultsUri: process.env.MONGO_URI_RESULTS,
    quizCollection: process.env.QUIZ_COLLECTION || 'school students',
    quizId: process.env.QUIZ_ID || 'career_school_v1'
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || 'ikscbandhan@gmail.com',
    pass: process.env.SMTP_PASS || 'ikscbandhan123',
    fromEmail: process.env.FROM_EMAIL || 'ikscbandhan@gmail.com',
    fromName: process.env.FROM_NAME || 'IKSC Bandhan'
  },
  
  branding: {
    site: process.env.BRAND_SITE || 'http://localhost:5000'
  }
};
