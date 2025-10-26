#!/usr/bin/env node
/**
 * Fix Database Path Script
 * Ensures data is stored in the correct database: Bandhan_wpd_report
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing Database Path Configuration...\n');

// Create the correct .env file content
const envContent = `# MongoDB Configuration
MONGO_URI_SOURCE=mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/Bandhan?retryWrites=true&w=majority&appName=PsychometricCluster
MONGO_URI_RESULTS=mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/Bandhan_wpd_report?retryWrites=true&w=majority&appName=PsychometricCluster

# Quiz Configuration
QUIZ_ID=career_school_v1
QUIZ_COLLECTION=school students

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# SMTP Configuration (Add your email credentials here)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=IKSC Bandhan

# Branding
BRAND_SITE=https://www.ikscbandhan.in
`;

try {
  // Write the .env file
  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file created successfully!');
  console.log('📁 Location: ' + envPath);
  console.log('\n📊 Configuration:');
  console.log('   Source Database: Bandhan');
  console.log('   Results Database: Bandhan_wpd_report');
  console.log('   Collection: school students');
  console.log('   Quiz ID: career_school_v1');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Update SMTP credentials in .env file');
  console.log('2. Restart your backend server');
  console.log('3. Test the quiz - data will now go to Bandhan_wpd_report');
  
  console.log('\n⚠️  Important:');
  console.log('   - Data will now be stored in Bandhan_wpd_report database');
  console.log('   - Collection will be "school students"');
  console.log('   - Make sure to update your email credentials');
  
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  console.log('\n💡 Manual Steps:');
  console.log('1. Create a .env file in the Backend directory');
  console.log('2. Copy the content above into the .env file');
  console.log('3. Update SMTP credentials');
  console.log('4. Restart the server');
}
