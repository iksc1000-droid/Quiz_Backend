#!/usr/bin/env node
/**
 * Test Email Sending
 * Tests if emails can be sent with current configuration
 */

import dotenv from 'dotenv';
import { createMailer } from './src/config/mailer.js';

// Load environment variables
dotenv.config();

console.log('📧 Testing Email Sending...\n');

async function testEmailSending() {
  try {
    console.log('🔧 Creating mailer...');
    const transporter = createMailer();
    console.log('✅ Mailer created');
    
    console.log('\n📧 Testing email sending...');
    
    const testEmail = {
      from: `"IKSC Bandhan" <${process.env.FROM_EMAIL}>`,
      to: 'test@example.com', // This won't actually send, just test the connection
      subject: 'Test Email from Quiz App',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<p>This is a test email to verify SMTP configuration.</p>'
    };
    
    console.log('📤 Attempting to send test email...');
    console.log(`   From: ${testEmail.from}`);
    console.log(`   To: ${testEmail.to}`);
    console.log(`   Subject: ${testEmail.subject}`);
    
    // Try to verify the connection first
    console.log('\n🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    console.log('\n📧 SMTP Configuration is working!');
    console.log('   The issue might be with the email credentials.');
    console.log('   Make sure to use real Gmail credentials in the .env file.');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Solution:');
      console.log('1. Update .env file with real Gmail credentials');
      console.log('2. Use Gmail App Password (not regular password)');
      console.log('3. Enable 2-factor authentication on Gmail');
      console.log('4. Generate App Password from Google Account settings');
    } else if (error.message.includes('Connection timeout')) {
      console.log('\n🔧 Solution:');
      console.log('1. Check your internet connection');
      console.log('2. Verify Gmail SMTP settings');
    } else {
      console.log('\n🔧 Solution:');
      console.log('1. Check the error message above');
      console.log('2. Verify email configuration');
    }
  }
}

// Run the test
testEmailSending().catch(error => {
  console.error('❌ Email test execution failed:', error);
  process.exit(1);
});