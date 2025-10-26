import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

console.log('📧 Testing Email Configuration...\n');

const testEmail = async () => {
  try {
    console.log('🔍 Email Configuration:');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP Port:', process.env.SMTP_PORT);
    console.log('SMTP Secure:', process.env.SMTP_SECURE);
    console.log('SMTP User:', process.env.SMTP_USER);
    console.log('SMTP Pass:', process.env.SMTP_PASS ? 'Present' : 'Missing');
    console.log('From Email:', process.env.FROM_EMAIL);
    console.log('From Name:', process.env.FROM_NAME);
    console.log('');

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log('✅ Email transporter created successfully');
    console.log('');

    // Test email sending
    console.log('📤 Sending test email...');
    
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: 'test@example.com', // Change this to your email for testing
      subject: 'Test Email from Quiz System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">Test Email from Quiz System</h2>
          <p>Dear Test User,</p>
          <p>This is a test email to verify that the email system is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Quiz System: Career Compass</li>
            <li>Top Category: Test Category</li>
            <li>Timestamp: ${new Date().toLocaleString()}</li>
          </ul>
          <p>If you receive this email, the email system is working perfectly!</p>
          <p>Best regards,<br>IKSC Bandhan Team</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    console.log('');
    console.log('📧 Email Status: WORKING PERFECTLY!');
    console.log('');
    console.log('💡 Note: If you want to test with a real email address,');
    console.log('   change the "to" field in the test-email.js file');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Error details:', error);
    
    if (error.code === 'EAUTH') {
      console.log('');
      console.log('🔧 AUTHENTICATION ERROR:');
      console.log('   - Check your Gmail password');
      console.log('   - Make sure 2-Factor Authentication is enabled');
      console.log('   - Use App Password instead of regular password');
      console.log('   - App Password: Generate from Google Account settings');
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('');
      console.log('🔧 CONNECTION ERROR:');
      console.log('   - Check your internet connection');
      console.log('   - Verify SMTP settings');
    }
  }
};

testEmail();
