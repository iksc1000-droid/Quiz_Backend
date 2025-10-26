import dotenv from 'dotenv';
dotenv.config();

import { createMailer, sendWelcomeEmail } from './src/config/mailer.js';

const testEmailVerification = async () => {
  try {
    console.log('📧 TESTING EMAIL SENDING...\n');
    
    // Create mailer
    const transporter = createMailer();
    console.log('✅ Mailer created');
    
    // Test email data
    const testData = {
      to: 'ikscbandhan@gmail.com', // Send to real email for testing
      name: 'Verification Test User',
      summary: {
        topCategory: 'Distractions',
        methodUsed: 'categorical_sum'
      }
    };
    
    console.log('📤 Sending test email to:', testData.to);
    
    // Send email
    const result = await sendWelcomeEmail(transporter, testData);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

testEmailVerification();


