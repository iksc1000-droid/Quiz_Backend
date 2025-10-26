#!/usr/bin/env node
/**
 * Setup Real Email Service
 * Sets up a working email service with proper Gmail configuration
 */

import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('📧 Setting up Real Email Service...\n');

// Create a working email configuration
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

// Update .env file
let envContent = '';
if (fs.existsSync('.env')) {
  envContent = fs.readFileSync('.env', 'utf8');
}

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

const updatedEnvContent = updatedLines.join('\n');
fs.writeFileSync('.env', updatedEnvContent);

console.log('\n✅ .env file updated with email configuration!');

// Test the email service
import nodemailer from 'nodemailer';

async function testEmailService() {
  try {
    console.log('\n🧪 Testing Email Service...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
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

    console.log('\n🎉 Email service is working!');
    console.log('   ✅ SMTP connection successful');
    console.log('   ✅ Email sending working');
    console.log('   ✅ Quiz app will send real emails');

  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    
    if (error.message.includes('Username and Password not accepted')) {
      console.log('\n🔧 Gmail Authentication Issue:');
      console.log('   The Gmail credentials are not working.');
      console.log('   This is because Gmail requires App Passwords for SMTP.');
      console.log('\n📋 Solution:');
      console.log('   1. Go to your Google Account settings');
      console.log('   2. Enable 2-factor authentication');
      console.log('   3. Generate an App Password');
      console.log('   4. Update the .env file with the App Password');
      console.log('\n🔧 Alternative: Use Mock Email Service');
      console.log('   The mock service logs emails instead of sending them.');
      console.log('   This allows the quiz to work without email credentials.');
      
      console.log('\n🎯 Recommendation:');
      console.log('   For now, use the mock email service so the quiz works.');
      console.log('   Later, you can set up real Gmail credentials.');
    }
  }
}

// Run the test
testEmailService().catch(error => {
  console.error('❌ Email service test failed:', error);
  process.exit(1);
});
