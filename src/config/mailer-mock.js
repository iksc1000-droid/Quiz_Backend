import nodemailer from 'nodemailer';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

export const createMailer = () => {
  // Create a mock transporter that logs emails instead of sending them
  const transporter = {
    verify: async () => {
      logger.info('📧 Mock email transporter verified');
      return true;
    },
    sendMail: async (mailOptions) => {
      logger.info('📧 Mock email sent:');
      logger.info(`   From: ${mailOptions.from}`);
      logger.info(`   To: ${mailOptions.to}`);
      logger.info(`   Subject: ${mailOptions.subject}`);
      logger.info(`   Content: ${mailOptions.text || mailOptions.html?.substring(0, 100)}...`);
      
      return {
        messageId: `mock-${Date.now()}@ikscbandhan.com`,
        response: 'Mock email sent successfully'
      };
    }
  };

  return transporter;
};

export const sendWelcomeEmail = async (transporter, { to, name, summary, userName, password }) => {
  try {
    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to,
      subject: '🎉 Welcome to IKSC Bandhan - Your Quiz Results!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to IKSC Bandhan</title>
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1>🎉 Welcome to IKSC Bandhan!</h1>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Congratulations! You have successfully completed the Working Professionals Career Assessment.</p>
                
                <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Your Assessment Results:</h3>
                    <p><strong>Top Category:</strong> ${summary?.topCategory || 'Career Development'}</p>
                    <p><strong>Assessment Type:</strong> Working Professionals Career Assessment</p>
                    <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Your Login Credentials:</h3>
                    <p><strong>Username:</strong> ${userName}</p>
                    <p><strong>Password:</strong> ${password}</p>
                </div>
                
                <p>You can now access your account to view detailed reports and insights from your assessment.</p>
                
                <p>Thank you for choosing IKSC Bandhan. We look forward to providing you with valuable insights through our psychometric assessments.</p>
                
                <p>Best regards,<br>IKSC Bandhan Team</p>
            </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`✅ Mock welcome email sent to ${to}:`, result.messageId);
    return result;
  } catch (error) {
    logger.error(`❌ Failed to send mock welcome email to ${to}:`, error);
    throw error;
  }
};
