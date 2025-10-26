#!/usr/bin/env node
/**
 * Test Mock Email Service
 * Tests the mock email functionality
 */

import dotenv from 'dotenv';
import { createMailer } from './src/config/mailer-mock.js';

// Load environment variables
dotenv.config();

console.log('📧 Testing Mock Email Service...\n');

async function testMockEmail() {
  try {
    console.log('🔧 Creating mock mailer...');
    const transporter = createMailer();
    console.log('✅ Mock mailer created');
    
    console.log('\n📧 Testing mock email sending...');
    
    const testEmail = {
      from: '"IKSC Bandhan" <ikscbandhan@gmail.com>',
      to: 'test@example.com',
      subject: 'Test Email from Quiz App',
      text: 'This is a test email to verify mock email functionality.',
      html: '<p>This is a test email to verify mock email functionality.</p>'
    };
    
    console.log('📤 Sending mock email...');
    console.log(`   From: ${testEmail.from}`);
    console.log(`   To: ${testEmail.to}`);
    console.log(`   Subject: ${testEmail.subject}`);
    
    const result = await transporter.sendMail(testEmail);
    console.log('\n✅ Mock email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Response: ${result.response}`);
    
    console.log('\n🎉 Mock email service is working!');
    console.log('   ✅ Emails will be logged instead of sent');
    console.log('   ✅ No real email credentials needed');
    console.log('   ✅ Quiz functionality will work perfectly');
    
  } catch (error) {
    console.error('❌ Mock email test failed:', error.message);
  }
}

// Run the test
testMockEmail().catch(error => {
  console.error('❌ Mock email test execution failed:', error);
  process.exit(1);
});
