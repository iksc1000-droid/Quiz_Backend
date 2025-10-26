#!/usr/bin/env node
/**
 * Fix Email Configuration
 * Updates the .env file with proper email settings
 */

import fs from 'fs';
import path from 'path';

console.log('📧 Fixing Email Configuration...\n');

// Get email credentials from user or use defaults
const emailUser = process.argv[2] || 'your-email@gmail.com';
const emailPass = process.argv[3] || 'your-app-password';

console.log('📊 Email Configuration:');
console.log(`   SMTP User: ${emailUser}`);
console.log(`   SMTP Pass: ${emailPass ? '***' : 'Not set'}`);

// Create the updated .env file content
const envContent = `# MongoDB Configuration
MONGO_URI_SOURCE=mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/Bandhan?retryWrites=true&w=majority&appName=PsychometricCluster
MONGO_URI_RESULTS=mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/demo_test_answer?retryWrites=true&w=majority&appName=PsychometricCluster

# Quiz Configuration
QUIZ_ID=career_school_v1
QUIZ_COLLECTION=school students

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=${emailUser}
SMTP_PASS=${emailPass}
FROM_EMAIL=${emailUser}
FROM_NAME=IKSC Bandhan

# Branding
BRAND_SITE=https://www.ikscbandhan.in
`;

try {
  // Write the .env file
  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ .env file updated with email configuration!');
  console.log('📁 Location: ' + envPath);
  
  console.log('\n📧 Email Configuration:');
  console.log(`   SMTP Host: smtp.gmail.com`);
  console.log(`   SMTP Port: 465`);
  console.log(`   SMTP User: ${emailUser}`);
  console.log(`   SMTP Pass: ${emailPass ? '***' : 'Not set'}`);
  console.log(`   From Email: ${emailUser}`);
  console.log(`   From Name: IKSC Bandhan`);
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Update the email credentials with your actual Gmail credentials');
  console.log('2. Make sure to use Gmail App Password (not regular password)');
  console.log('3. Restart your backend server');
  console.log('4. Test the quiz - emails should now work');
  
  console.log('\n⚠️  Important:');
  console.log('   - Use Gmail App Password, not your regular Gmail password');
  console.log('   - Enable 2-factor authentication on your Gmail account');
  console.log('   - Generate App Password from Google Account settings');
  
  console.log('\n🎯 Usage:');
  console.log('   node fix-email-config.js [email] [app_password]');
  console.log('   Example: node fix-email-config.js myemail@gmail.com myapppassword123');
  
} catch (error) {
  console.error('❌ Failed to update email configuration:', error.message);
  console.log('\n💡 Manual Steps:');
  console.log('1. Open the .env file');
  console.log('2. Update SMTP_USER with your Gmail address');
  console.log('3. Update SMTP_PASS with your Gmail App Password');
  console.log('4. Update FROM_EMAIL with your Gmail address');
  console.log('5. Restart the server');
}
