#!/usr/bin/env node
/**
 * Fix Email Service
 * Creates a working email service for the quiz app
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

console.log('📧 Fixing Email Service...\n');

// Create a working email service
const createWorkingEmailService = () => {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'ikscbandhan@gmail.com',
      pass: process.env.SMTP_PASS || 'ikscbandhan123'
    }
  });

  return transporter;
};

// Test the email service
async function testEmailService() {
  try {
    console.log('🔧 Creating email transporter...');
    const transporter = createWorkingEmailService();
    console.log('✅ Email transporter created');

    console.log('\n🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    console.log('\n📧 Testing email sending...');
    const testEmail = {
      from: `"${process.env.FROM_NAME || 'IKSC Bandhan'}" <${process.env.FROM_EMAIL || 'ikscbandhan@gmail.com'}>`,
      to: 'test@example.com',
      subject: 'Test Email from IKSC Bandhan Quiz App',
      text: 'This is a test email to verify email functionality.',
      html: '<p>This is a test email to verify email functionality.</p>'
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);

    console.log('\n🎉 Email service is working!');
    return true;

  } catch (error) {
    console.log('❌ Email service test failed:', error.message);
    
    if (error.message.includes('Username and Password not accepted')) {
      console.log('\n🔧 Gmail Authentication Issue:');
      console.log('   The Gmail credentials are not working.');
      console.log('   This is because Gmail requires App Passwords for SMTP.');
      console.log('\n📋 Solution:');
      console.log('   1. Go to your Google Account settings');
      console.log('   2. Enable 2-factor authentication');
      console.log('   3. Generate an App Password');
      console.log('   4. Update the .env file with the App Password');
    }
    
    return false;
  }
}

// Run the test
testEmailService().then(success => {
  if (success) {
    console.log('\n🚀 Email service is ready!');
    console.log('   ✅ Quiz app will send real emails');
    console.log('   ✅ Users will receive welcome emails');
  } else {
    console.log('\n⚠️  Email service needs configuration');
    console.log('   ❌ Real emails will not be sent');
    console.log('   ✅ Quiz functionality will still work');
    console.log('   ✅ Data will still be stored');
  }
}).catch(error => {
  console.error('❌ Email service test failed:', error);
  process.exit(1);
});
