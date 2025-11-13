import nodemailer from 'nodemailer';
import { config } from './env.js';
import { logger } from '../utils/logger.js';
import { getQuizConfig } from './quizConfig.js';

export const createMailer = () => {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.info('📧 Mailer configuration:', {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      user: config.smtp.user,
      fromEmail: config.smtp.fromEmail,
      fromName: config.smtp.fromName
    });
  }

  return transporter;
};

export const sendWelcomeEmail = async (transporter, { to, name, summary, quizId, resultToken }) => {
    try {
      // Get quiz-specific configuration
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📧 [EMAIL] Generating email for quizId: ${quizId}`);
      }
      const quizConfig = getQuizConfig(quizId);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📧 [EMAIL] Quiz config:`, quizConfig);
      }
      
      // ✅ FINAL FIXED LINK (NO OVERRIDE ANYWHERE ELSE NOW)
      // Hardcoded URL - no dependency on BRAND_SITE
      const resultsUrl = 'https://conflict-resolution-quiz.ikscbandhan.in/divorce-email';
  
      // Strong backend debug
      console.log("🔥 [EMAIL][DEBUG_RESULTS_URL] USING URL:", resultsUrl);
      logger.info("[EMAIL][DEBUG_RESULTS_URL]", {
        to,
        quizId,
        resultToken,
        resultsUrl,
        env: process.env.NODE_ENV
      });
  
      const mailOptions = {
        from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
        to,
        subject: `🌟 You've Taken the First Step, ${name} — Your IKSC Bandhan ${quizConfig.category} Quiz Result Awaits!`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Your IKSC Bandhan ${quizConfig.category} Quiz Results</title>
              <style>
                  body {
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      line-height: 1.8;
                      color: #333;
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #f8fafc;
                  }
                  .container {
                      background-color: white;
                      padding: 40px;
                      border-radius: 16px;
                      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                      border: 1px solid #e2e8f0;
                  }
                  .header {
                      text-align: center;
                      margin-bottom: 40px;
                      background: linear-gradient(135deg, ${quizConfig.color}20 0%, ${quizConfig.color}40 100%);
                      padding: 30px;
                      border-radius: 12px;
                      border-left: 4px solid ${quizConfig.color};
                  }
                  .header h1 {
                      margin: 0 0 10px 0;
                      font-size: 24px;
                      color: ${quizConfig.color};
                      font-weight: 700;
                  }
                  .header .emoji {
                      font-size: 32px;
                      margin-bottom: 10px;
                  }
                  .content {
                      margin-bottom: 30px;
                  }
                  .greeting {
                      font-size: 18px;
                      margin-bottom: 20px;
                      color: #1a202c;
                  }
                  .highlight {
                      color: ${quizConfig.color};
                      font-weight: 600;
                  }
                  .strength-section {
                      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                      padding: 25px;
                      border-radius: 12px;
                      margin: 25px 0;
                      border-left: 4px solid #0ea5e9;
                  }
                  .glimpse-section {
                      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                      padding: 25px;
                      border-radius: 12px;
                      margin: 25px 0;
                      border-left: 4px solid #22c55e;
                  }
                  .glimpse-section h3 {
                      color: #166534;
                      margin-top: 0;
                      font-size: 18px;
                  }
                  .glimpse-list {
                      list-style: none;
                      padding: 0;
                      margin: 15px 0;
                  }
                  .glimpse-list li {
                      padding: 8px 0;
                      position: relative;
                      padding-left: 25px;
                  }
                  .glimpse-list li:before {
                      content: "✨";
                      position: absolute;
                      left: 0;
                      top: 8px;
                  }
                  .cta-section {
                      text-align: center;
                      margin: 30px 0;
                  }
                  .cta-button {
                      display: inline-block;
                      background: linear-gradient(135deg, ${quizConfig.color} 0%, ${quizConfig.color}dd 100%);
                      color: white;
                      padding: 16px 32px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: 600;
                      font-size: 16px;
                      box-shadow: 0 4px 12px ${quizConfig.color}40;
                      transition: transform 0.2s ease;
                  }
                  .cta-button:hover {
                      transform: translateY(-2px);
                  }
                  .wish-section {
                      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                      padding: 25px;
                      border-radius: 12px;
                      margin: 25px 0;
                      border-left: 4px solid #f59e0b;
                  }
                  .wish-section h3 {
                      color: #92400e;
                      margin-top: 0;
                      font-size: 18px;
                  }
                  .footer {
                      border-top: 2px solid #e2e8f0;
                      padding-top: 25px;
                      text-align: center;
                      color: #64748b;
                      font-size: 14px;
                      margin-top: 30px;
                  }
                  .signature {
                      margin: 20px 0;
                      font-style: italic;
                      color: #4a5568;
                  }
                  .branding {
                      font-weight: 600;
                      color: ${quizConfig.color};
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <div class="emoji">${quizConfig.emoji}</div>
                      <h1>You've Taken the First Step, ${name}!</h1>
                      <p>Your IKSC Bandhan ${quizConfig.category} Quiz Result Awaits!</p>
                  </div>
                  
                  <div class="content">
                      <div class="greeting">
                          Hello <span class="highlight">${name}</span>,
                      </div>
                      
                      <p>Congratulations on completing your IKSC Bandhan <span class="highlight">${quizConfig.category} Quiz</span>! 🎉<br>
                      You've taken a meaningful first step — one that only a few people ever take — toward understanding yourself better.</p>
                      
                      <div class="strength-section">
                          <p>Your responses reveal that your strongest quality is <span class="highlight">${summary?.topCategory || 'Personal Growth'}</span> — a unique strength that shapes how you think, work, and connect with the world around you. ✨</p>
                          
                          <p>But remember — this quiz is just the first <strong>5%</strong> of your journey.<br>
                          The remaining <strong>95%</strong> holds the real transformation — a deeper exploration of your personality, purpose, and potential.<br>
                          That's where growth truly begins… and we're here to help you uncover it. 🌱</p>
                      </div>
                      
                      <div class="glimpse-section">
                          <h3>🌿 A Glimpse of What Awaits in Your Full Report</h3>
                          <ul class="glimpse-list">
                              <li>Personalised insights into how your mind and emotions shape decisions</li>
                              <li>Deeper understanding of your ${quizConfig.description.toLowerCase()}</li>
                              <li>Guidance to turn your strengths into lasting success</li>
                              <li>A clear roadmap to live and work with balance, confidence, and purpose</li>
                          </ul>
                      </div>
                      
                      <div class="cta-section">
                          <h3>🚀 Next Step: See Your Quiz Result</h3>
                          <p>Click below to view your personalised quiz summary and continue your journey of self-discovery:</p>
                          <a href="${resultsUrl}" class="cta-button">See My Quiz Result</a>
                          <p style="margin-top: 15px; font-size: 14px; color: #64748b;">
                              After viewing your results, don't forget to register for free to unlock your full IKSC Bandhan profile —<br>
                              and discover your complete personality blueprint designed to help you grow from the inside out.
                          </p>
                      </div>
                      
                      <div class="wish-section">
                          <h3>💛 Our Wish for You</h3>
                          <p>May this small beginning lead you to greater clarity, confidence, and calm.<br>
                          Every big change starts with one simple act of self-awareness — and you've already taken that step today. 🌈</p>
                          
                          <p>We'll continue walking beside you — guiding, decoding, and celebrating your progress every step of the way.<br>
                          Over the next few days, you'll also receive a few short, informative emails designed specially for you — inspired by your quiz results — to help you reflect, grow, and stay inspired. ✨</p>
                      </div>
                      
                      <div class="signature">
                          <p>Warm regards,<br>
                          Team IKSC Bandhan — <span class="branding">${quizConfig.branding}</span><br>
                          <em>"Discover Who You Are — Inside and Out."</em></p>
                      </div>
                  </div>
                  
                  <div class="footer">
                      <p>Sent from: ${config.smtp.fromEmail}</p>
                      <p>© ${new Date().getFullYear()} IKSC Bandhan. All rights reserved.</p>
                  </div>
              </div>
          </body>
          </html>
        `
      };
  
      const result = await transporter.sendMail(mailOptions);
      logger.info(`✅ Welcome email sent to ${to}:`, result.messageId);
      return result;
    } catch (error) {
      logger.error(`❌ Failed to send welcome email to ${to}:`, error.message || error);
      logger.error(`❌ Email send error details:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack
      });
      throw error;
    }
  };
  