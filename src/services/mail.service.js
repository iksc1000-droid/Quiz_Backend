import { logger } from '../utils/logger.js';
import { sendWelcomeEmail } from '../config/mailer.js';

/**
 * MailService - Wrapper service for sending emails
 * 
 * PRODUCTION EMAIL FLOW:
 * 1. quiz.controller.js -> queueWelcomeToUser()
 * 2. mail.service.js -> sendWelcome() <- THIS METHOD
 * 3. mailer.js -> sendWelcomeEmail() -> builds URL via getResultsUrlForQuiz()
 * 
 * This service does NOT build result URLs - it delegates to mailer.js
 * All URL construction happens in src/config/mailer.js via getResultsUrlForQuiz()
 */
export class MailService {
  constructor(transporter) {
    this.transporter = transporter;
  }

  async sendWelcome({ to, name, summary, quizId, resultToken }) {
    try {
      // Validate email address
      if (!to || !to.includes('@')) {
        throw new Error(`Invalid email address: ${to}`);
      }

      // Ensure quizId is never undefined - use fallback chain
      const finalQuizId =
        quizId ||
        process.env.QUIZ_ID ||
        'divorce_conflict_v1';

      logger.info('[MAIL_SERVICE][SEND_WELCOME]', {
        to,
        incomingQuizId: quizId,
        envQuizId: process.env.QUIZ_ID,
        finalQuizId
      });

      logger.info(`📧 [EMAIL] Attempting to send welcome email to: ${to}`);
      logger.info(`📧 [EMAIL] Delegating to sendWelcomeEmail() in mailer.js - URL will be built there`);
      
      // Delegate to mailer.js - it handles URL construction via getResultsUrlForQuiz()
      // Pass finalQuizId to ensure it's never undefined
      const result = await sendWelcomeEmail(this.transporter, {
        to,
        name,
        summary,
        quizId: finalQuizId,
        resultToken
      });
      
      if (!result || !result.messageId) {
        throw new Error('Email sent but no messageId returned - email may not have been delivered');
      }
      
      logger.info(`✅ Welcome email sent successfully to ${to}, messageId: ${result.messageId}`);
      return result;
    } catch (error) {
      // Determine the actual error reason
      let errorReason = 'Unknown error';
      
      if (error.code === 'EAUTH') {
        errorReason = 'SMTP authentication failed - check SMTP_USER and SMTP_PASS in .env file (password should have NO spaces)';
      } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        errorReason = 'SMTP connection failed - check internet connection and SMTP_HOST/port settings';
      } else if (error.responseCode === 535) {
        errorReason = 'Gmail authentication failed - verify App Password is correct (16 chars, no spaces) and 2FA is enabled';
      } else if (error.responseCode === 550) {
        errorReason = 'Email rejected by server - check sender email address and Gmail account settings';
      } else if (error.message) {
        errorReason = error.message;
      }
      
      logger.error(`❌ Failed to send welcome email to ${to}`);
      logger.error(`❌ Error reason: ${errorReason}`);
      logger.error(`❌ Error code: ${error.code || 'N/A'}`);
      logger.error(`❌ Response code: ${error.responseCode || 'N/A'}`);
      logger.error(`❌ Full error:`, {
        message: error.message,
        code: error.code,
        response: error.response,
        responseCode: error.responseCode,
        command: error.command,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
      
      // Throw error with clear message so caller knows it failed
      throw new Error(`Email sending failed: ${errorReason}`);
    }
  }

  async sendOwnerNotification({ to, student }) {
    try {
      const recipient = to || process.env.OWNER_EMAIL;
      
      if (!recipient) {
        logger.warn(`⚠️  No owner email configured, skipping notification`);
        return null;
      }

      logger.info(`📧 [EMAIL] Attempting to send owner notification to: ${recipient}`);
      
      const result = await this.transporter.sendMail({
        from: `"IKSC Bandhan" <${process.env.FROM_EMAIL}>`,
        to: recipient,
        subject: `New quiz attempt: ${student.email}`,
        html: `<pre>${JSON.stringify(student, null, 2)}</pre>`
      });
      
      if (!result || !result.messageId) {
        throw new Error('Owner notification sent but no messageId returned');
      }
      
      logger.info(`✅ Owner notification sent successfully to ${recipient}, messageId: ${result.messageId}`);
      return result;
    } catch (error) {
      // Determine the actual error reason
      let errorReason = 'Unknown error';
      
      if (error.code === 'EAUTH') {
        errorReason = 'SMTP authentication failed - check SMTP credentials';
      } else if (error.code === 'ECONNECTION') {
        errorReason = 'SMTP connection failed';
      } else if (error.message) {
        errorReason = error.message;
      }
      
      logger.error(`❌ Failed to send owner notification: ${errorReason}`);
      logger.error(`❌ Error details:`, {
        message: error.message,
        code: error.code,
        responseCode: error.responseCode
      });
      
      // Don't throw for owner notification - it's less critical
      return null;
    }
  }
}
