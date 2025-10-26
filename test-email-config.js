#!/usr/bin/env node
/**
 * Test Email Configuration
 * Checks if email settings are properly configured
 */

import dotenv from 'dotenv';
import { config } from './src/config/env.js';

// Load environment variables
dotenv.config();

console.log('📧 Testing Email Configuration...\n');

console.log('📊 Current Email Settings:');
console.log(`   SMTP Host: ${config.smtp.host}`);
console.log(`   SMTP Port: ${config.smtp.port}`);
console.log(`   SMTP User: ${config.smtp.user || 'NOT SET'}`);
console.log(`   SMTP Pass: ${config.smtp.pass ? '***' : 'NOT SET'}`);
console.log(`   From Email: ${config.smtp.fromEmail || 'NOT SET'}`);
console.log(`   From Name: ${config.smtp.fromName || 'NOT SET'}`);

console.log('\n🔍 Environment Variables:');
console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***' : 'NOT SET'}`);
console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
console.log(`   FROM_NAME: ${process.env.FROM_NAME || 'NOT SET'}`);

// Check if email is properly configured
const isEmailConfigured = config.smtp.user && config.smtp.pass && config.smtp.fromEmail;

console.log('\n📊 Configuration Status:');
console.log(`   Email Configured: ${isEmailConfigured ? '✅ YES' : '❌ NO'}`);

if (!isEmailConfigured) {
  console.log('\n❌ Email is not properly configured!');
  console.log('\n🔧 To fix this:');
  console.log('1. Update the .env file with your Gmail credentials');
  console.log('2. Use Gmail App Password (not regular password)');
  console.log('3. Make sure SMTP_USER, SMTP_PASS, and FROM_EMAIL are set');
  console.log('4. Restart the server');
  
  console.log('\n💡 Example .env configuration:');
  console.log('SMTP_USER=your-email@gmail.com');
  console.log('SMTP_PASS=your-app-password');
  console.log('FROM_EMAIL=your-email@gmail.com');
  console.log('FROM_NAME=IKSC Bandhan');
} else {
  console.log('\n✅ Email configuration looks good!');
  console.log('   If emails are still not sending, check:');
  console.log('   1. Gmail App Password is correct');
  console.log('   2. 2-factor authentication is enabled');
  console.log('   3. App Password is generated correctly');
}
