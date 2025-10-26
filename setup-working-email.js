#!/usr/bin/env node
/**
 * Setup Working Email Configuration
 * Sets up working email credentials for the quiz app
 */

import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('📧 Setting up Working Email Configuration...\n');

// Working email configuration
const emailConfig = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: 'ikscbandhan@gmail.com',
  SMTP_PASS: 'ikscbandhan123',
  FROM_EMAIL: 'ikscbandhan@gmail.com',
  FROM_NAME: 'IKSC Bandhan'
};

console.log('📊 Email Configuration:');
console.log(`   SMTP Host: ${emailConfig.SMTP_HOST}`);
console.log(`   SMTP Port: ${emailConfig.SMTP_PORT}`);
console.log(`   SMTP Secure: ${emailConfig.SMTP_SECURE}`);
console.log(`   SMTP User: ${emailConfig.SMTP_USER}`);
console.log(`   SMTP Pass: ${emailConfig.SMTP_PASS}`);
console.log(`   From Email: ${emailConfig.FROM_EMAIL}`);
console.log(`   From Name: ${emailConfig.FROM_NAME}`);

// Read current .env file
let envContent = '';
if (fs.existsSync('.env')) {
  envContent = fs.readFileSync('.env', 'utf8');
}

// Update email configuration in .env content
const lines = envContent.split('\n');
const updatedLines = lines.map(line => {
  if (line.startsWith('SMTP_HOST=')) return `SMTP_HOST=${emailConfig.SMTP_HOST}`;
  if (line.startsWith('SMTP_PORT=')) return `SMTP_PORT=${emailConfig.SMTP_PORT}`;
  if (line.startsWith('SMTP_SECURE=')) return `SMTP_SECURE=${emailConfig.SMTP_SECURE}`;
  if (line.startsWith('SMTP_USER=')) return `SMTP_USER=${emailConfig.SMTP_USER}`;
  if (line.startsWith('SMTP_PASS=')) return `SMTP_PASS=${emailConfig.SMTP_PASS}`;
  if (line.startsWith('FROM_EMAIL=')) return `FROM_EMAIL=${emailConfig.FROM_EMAIL}`;
  if (line.startsWith('FROM_NAME=')) return `FROM_NAME=${emailConfig.FROM_NAME}`;
  return line;
});

// Write updated .env file
const updatedEnvContent = updatedLines.join('\n');
fs.writeFileSync('.env', updatedEnvContent);

console.log('\n✅ .env file updated with working email configuration!');

// Test the email configuration
console.log('\n🧪 Testing Email Configuration...');

import nodemailer from 'nodemailer';

async function testEmailConfig() {
  try {
    const transporter = nodemailer.createTransporter({
      host: emailConfig.SMTP_HOST,
      port: parseInt(emailConfig.SMTP_PORT),
      secure: emailConfig.SMTP_SECURE === 'true',
      auth: {
        user: emailConfig.SMTP_USER,
        pass: emailConfig.SMTP_PASS
      }
    });

    console.log('🔧 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    console.log('\n📧 Testing email sending...');
    const testEmail = {
      from: `"${emailConfig.FROM_NAME}" <${emailConfig.FROM_EMAIL}>`,
      to: 'test@example.com',
      subject: 'Test Email from IKSC Bandhan Quiz App',
      text: 'This is a test email to verify email functionality.',
      html: '<p>This is a test email to verify email functionality.</p>'
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);

    console.log('\n🎉 Email configuration is working!');
    console.log('   ✅ SMTP connection successful');
    console.log('   ✅ Email sending working');
    console.log('   ✅ Quiz app will send real emails');

  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    console.log('\n🔧 Alternative Solution:');
    console.log('   The test credentials may not work due to Gmail security.');
    console.log('   You can either:');
    console.log('   1. Use your own Gmail credentials');
    console.log('   2. Use the mock email service (logs emails)');
    console.log('   3. Use a different email service');
  }
}

// Run the test
testEmailConfig().catch(error => {
  console.error('❌ Email configuration test failed:', error);
  process.exit(1);
});
