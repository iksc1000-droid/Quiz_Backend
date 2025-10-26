import crypto from 'crypto';

export class TokenGenerator {
  static generateResultToken(quizId, userId) {
    // Extract quiz type from quizId (e.g., senior_citizen_v1 -> senior_citizen)
    const quizType = quizId.replace('_v1', '');
    
    // Generate timestamp
    const timestamp = Date.now().toString(36);
    
    // Generate random string
    const randomString = crypto.randomBytes(8).toString('hex');
    
    // Create token: {quizType}_{userId}_{timestamp}_{random}
    const token = `${quizType}_${userId}_${timestamp}_${randomString}`;
    
    console.log(`🎫 Generated token for quiz ${quizId}: ${token}`);
    return token;
  }

  static parseToken(token) {
    if (!token) return null;
    
    const parts = token.split('_');
    if (parts.length < 4) return null;
    
    return {
      quizType: parts[0] + '_' + parts[1], // senior_citizen
      userId: parts[2],
      timestamp: parts[3],
      random: parts[4],
      quizId: `${parts[0]}_${parts[1]}_v1` // senior_citizen_v1
    };
  }

  static isValidToken(token) {
    const parsed = this.parseToken(token);
    return parsed !== null;
  }
}
