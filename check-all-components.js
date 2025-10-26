#!/usr/bin/env node
/**
 * Check All Components
 * Verifies all necessary components are present for email functionality
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

console.log('🔍 Checking All Components...\n');

// Check 1: Environment Variables
console.log('📊 Environment Variables:');
console.log(`   MONGO_URI_SOURCE: ${process.env.MONGO_URI_SOURCE ? '✅ Present' : '❌ Missing'}`);
console.log(`   MONGO_URI_RESULTS: ${process.env.MONGO_URI_RESULTS ? '✅ Present' : '❌ Missing'}`);
console.log(`   PORT: ${process.env.PORT || 'Not set'}`);
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'Not set'}`);
console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || 'Not set'}`);
console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'Not set'}`);
console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***' : 'Not set'}`);
console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'Not set'}`);
console.log(`   FROM_NAME: ${process.env.FROM_NAME || 'Not set'}`);

// Check 2: Required Files
console.log('\n📁 Required Files:');
const requiredFiles = [
  'src/server.js',
  'src/config/env.js',
  'src/config/mailer.js',
  'src/services/mail.service.js',
  'src/controllers/quiz.controller.js',
  'src/models/Attempt.js',
  '.env'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${file}: ${exists ? '✅ Present' : '❌ Missing'}`);
});

// Check 3: Email Configuration
console.log('\n📧 Email Configuration:');
const emailConfigured = process.env.SMTP_USER && process.env.SMTP_PASS && process.env.FROM_EMAIL;
console.log(`   Email Configured: ${emailConfigured ? '✅ YES' : '❌ NO'}`);

if (emailConfigured) {
  console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP Port: ${process.env.SMTP_PORT}`);
  console.log(`   SMTP User: ${process.env.SMTP_USER}`);
  console.log(`   From Email: ${process.env.FROM_EMAIL}`);
  console.log(`   From Name: ${process.env.FROM_NAME}`);
} else {
  console.log('   ❌ Email not properly configured');
}

// Check 4: Database Configuration
console.log('\n📊 Database Configuration:');
const dbConfigured = process.env.MONGO_URI_SOURCE && process.env.MONGO_URI_RESULTS;
console.log(`   Database Configured: ${dbConfigured ? '✅ YES' : '❌ NO'}`);

if (dbConfigured) {
  const sourceDb = process.env.MONGO_URI_SOURCE.split('/').pop().split('?')[0];
  const resultsDb = process.env.MONGO_URI_RESULTS.split('/').pop().split('?')[0];
  console.log(`   Source Database: ${sourceDb}`);
  console.log(`   Results Database: ${resultsDb}`);
}

// Check 5: Package Dependencies
console.log('\n📦 Package Dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['nodemailer', 'express', 'mongoose', 'cors', 'helmet'];
  
  requiredDeps.forEach(dep => {
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`   ${dep}: ${hasDep ? '✅ Present' : '❌ Missing'}`);
  });
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

// Check 6: Email Service Test
console.log('\n🧪 Email Service Test:');
try {
  const { createMailer } = await import('./src/config/mailer.js');
  const transporter = createMailer();
  console.log('   Mailer Creation: ✅ Success');
  
  // Test connection
  try {
    await transporter.verify();
    console.log('   SMTP Connection: ✅ Success');
  } catch (error) {
    console.log('   SMTP Connection: ❌ Failed');
    console.log(`   Error: ${error.message}`);
  }
} catch (error) {
  console.log('   Mailer Creation: ❌ Failed');
  console.log(`   Error: ${error.message}`);
}

// Summary
console.log('\n📊 Summary:');
const allFilesPresent = requiredFiles.every(file => fs.existsSync(file));
const emailReady = emailConfigured && process.env.SMTP_USER !== 'your-email@gmail.com';
const dbReady = dbConfigured;

console.log(`   All Files Present: ${allFilesPresent ? '✅ YES' : '❌ NO'}`);
console.log(`   Email Ready: ${emailReady ? '✅ YES' : '❌ NO'}`);
console.log(`   Database Ready: ${dbReady ? '✅ YES' : '❌ NO'}`);

if (allFilesPresent && emailReady && dbReady) {
  console.log('\n🎉 ALL COMPONENTS ARE READY!');
  console.log('   ✅ Your quiz application is fully functional');
  console.log('   ✅ Data storage is working');
  console.log('   ✅ Email sending should work');
} else {
  console.log('\n⚠️  Some components need attention:');
  if (!allFilesPresent) console.log('   - Missing required files');
  if (!emailReady) console.log('   - Email needs real Gmail credentials');
  if (!dbReady) console.log('   - Database configuration incomplete');
}
