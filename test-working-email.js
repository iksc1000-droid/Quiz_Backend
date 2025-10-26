#!/usr/bin/env node
/**
 * Test Working Email Service
 * Tests the working email functionality using correct nodemailer syntax
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

console.log('📧 Testing Working Email Service...\n');

async function testWorkingEmail() {
  try {
    console.log('📊 Current Email Configuration:');
    console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`   SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`   SMTP Secure: ${process.env.SMTP_SECURE}`);
    console.log(`   SMTP User: ${process.env.SMTP_USER}`);
    console.log(`   SMTP Pass: ${process.env.SMTP_PASS ? '***' : 'Not set'}`);
    console.log(`   From Email: ${process.env.FROM_EMAIL}`);
    console.log(`   From Name: ${process.env.FROM_NAME}`);

    // Create transporter using correct syntax
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || 'ikscbandhan@gmail.com',
        pass: process.env.SMTP_PASS || 'ikscbandhan123'
      }
    });

    console.log('\n🔧 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

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
    }
  }
}

// Run the test
testWorkingEmail().catch(error => {
  console.error('❌ Email test execution failed:', error);
  process.exit(1);
});
