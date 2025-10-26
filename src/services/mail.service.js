import { logger } from '../utils/logger.js';
import { sendWelcomeEmail } from '../config/mailer.js';

export class MailService {
  constructor(transporter) {
    this.transporter = transporter;
  }

  async sendWelcome({ to, name, summary, userName, password, quizId }) {
    try {
      const result = await sendWelcomeEmail(this.transporter, { to, name, summary, userName, password, quizId });
      logger.info(`✅ Welcome email sent to ${to}`);
      return result;
    } catch (error) {
      logger.error(`❌ Failed to send welcome email to ${to}:`, error);
      // Don't throw error - email failure shouldn't break the flow
      return null;
    }
  }

  async sendOwnerNotification({ to, student }) {
    try {
      const result = await this.transporter.sendMail({
        from: `"IKSC Bandhan" <${process.env.FROM_EMAIL}>`,
        to: to || process.env.OWNER_EMAIL,
        subject: `New quiz attempt: ${student.email}`,
        html: `<pre>${JSON.stringify(student, null, 2)}</pre>`
      });
      logger.info(`✅ Owner notification sent to ${to || process.env.OWNER_EMAIL}`);
      return result;
    } catch (error) {
      logger.error(`❌ Failed to send owner notification:`, error);
      return null;
    }
  }
}
