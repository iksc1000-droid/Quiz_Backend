#!/usr/bin/env node
/**
 * Change Database Configuration
 * Allows you to change database and collection names
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Change Database Configuration\n');

// Get user input for new names
const newDatabaseName = process.argv[2] || 'MyQuizDB';
const newCollectionName = process.argv[3] || 'quiz_attempts';

console.log('📊 New Configuration:');
console.log(`   Database: ${newDatabaseName}`);
console.log(`   Collection: ${newCollectionName}`);

// Create the new .env file content
const envContent = `# MongoDB Configuration
MONGO_URI_SOURCE=mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/Bandhan?retryWrites=true&w=majority&appName=PsychometricCluster
MONGO_URI_RESULTS=mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/${newDatabaseName}?retryWrites=true&w=majority&appName=PsychometricCluster

# Quiz Configuration
QUIZ_ID=career_school_v1
QUIZ_COLLECTION=${newCollectionName}

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
  
  console.log('\n✅ .env file updated successfully!');
  console.log('📁 Location: ' + envPath);
  
  console.log('\n📊 Updated Configuration:');
  console.log(`   Source Database: Bandhan`);
  console.log(`   Results Database: ${newDatabaseName}`);
  console.log(`   Collection: ${newCollectionName}`);
  console.log(`   Quiz ID: career_school_v1`);
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Restart your backend server');
  console.log('2. Test the quiz - data will now go to the new location');
  console.log(`3. Check MongoDB Compass: ${newDatabaseName} > ${newCollectionName}`);
  
  console.log('\n⚠️  Important:');
  console.log(`   - Data will now be stored in ${newDatabaseName} database`);
  console.log(`   - Collection will be "${newCollectionName}"`);
  console.log('   - Make sure the database exists in MongoDB Atlas');
  
} catch (error) {
  console.error('❌ Failed to update configuration:', error.message);
  console.log('\n💡 Manual Steps:');
  console.log('1. Create a .env file in the Backend directory');
  console.log('2. Copy the content above into the .env file');
  console.log('3. Update the database and collection names as needed');
  console.log('4. Restart the server');
}

console.log('\n🎯 Usage:');
console.log('   node change-database-config.js [database_name] [collection_name]');
console.log('   Example: node change-database-config.js MyQuizDB quiz_attempts');
