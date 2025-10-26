#!/usr/bin/env node
/**
 * Test Real Email with Gmail App Password
 * Tests real email sending with correct Gmail configuration
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

console.log('📧 Testing Real Email with Gmail App Password...\n');

async function testRealEmail() {
  try {
    console.log('📊 Current Email Configuration:');
    console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`   SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`   SMTP Secure: ${process.env.SMTP_SECURE}`);
    console.log(`   SMTP User: ${process.env.SMTP_USER}`);
    console.log(`   SMTP Pass: ${process.env.SMTP_PASS ? '***' : 'Not set'}`);
    console.log(`   From Email: ${process.env.FROM_EMAIL}`);
    console.log(`   From Name: ${process.env.FROM_NAME}`);

    // Create transporter with correct Gmail settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Gmail specific settings
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });

    console.log('\n🔧 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    console.log('\n📧 Testing real email sending...');
    const testEmail = {
      from: `"${process.env.FROM_NAME || 'IKSC Bandhan'}" <${process.env.FROM_EMAIL || 'ikscbandhan@gmail.com'}>`,
      to: 'test@example.com',
      subject: '🎉 Test Email from IKSC Bandhan Quiz App',
      text: 'This is a test email to verify real email functionality with Gmail App Password.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">🎉 Test Email from IKSC Bandhan</h1>
          <p>This is a test email to verify real email functionality with Gmail App Password.</p>
          <p><strong>Email Service:</strong> Working with real Gmail credentials</p>
          <p><strong>App Password:</strong> Configured correctly</p>
          <p><strong>Status:</strong> ✅ Real email sending is working!</p>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Real email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Response: ${result.response}`);

    console.log('\n🎉 Real email service is working!');
    console.log('   ✅ SMTP connection successful');
    console.log('   ✅ Real email sending working');
    console.log('   ✅ Gmail App Password configured correctly');
    console.log('   ✅ Quiz app will send real emails to users');

  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    
    if (error.message.includes('Username and Password not accepted')) {
      console.log('\n🔧 Gmail Authentication Issue:');
      console.log('   The Gmail App Password is not working.');
      console.log('   Possible issues:');
      console.log('   1. App Password might be incorrect');
      console.log('   2. 2-factor authentication not enabled');
      console.log('   3. App Password not generated correctly');
      console.log('\n📋 Solution:');
      console.log('   1. Go to Google Account settings');
      console.log('   2. Enable 2-factor authentication');
      console.log('   3. Generate a new App Password');
      console.log('   4. Update the .env file with the new password');
    } else if (error.message.includes('Connection timeout')) {
      console.log('\n🔧 Connection Issue:');
      console.log('   Network or firewall issue.');
      console.log('   Try checking your internet connection.');
    } else {
      console.log('\n🔧 Other Issue:');
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Run the test
testRealEmail().catch(error => {
  console.error('❌ Email test execution failed:', error);
  process.exit(1);
});
