#!/usr/bin/env node
/**
 * Check Environment Variables
 * Shows exactly what database configuration is being used
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Checking Environment Variables...\n');

console.log('📊 Environment Variables:');
console.log(`   MONGO_URI_SOURCE: ${process.env.MONGO_URI_SOURCE ? 'Set' : 'Not set'}`);
console.log(`   MONGO_URI_RESULTS: ${process.env.MONGO_URI_RESULTS ? 'Set' : 'Not set'}`);
console.log(`   QUIZ_COLLECTION: ${process.env.QUIZ_COLLECTION || 'Not set'}`);
console.log(`   QUIZ_ID: ${process.env.QUIZ_ID || 'Not set'}`);

if (process.env.MONGO_URI_SOURCE) {
  const sourceDb = process.env.MONGO_URI_SOURCE.split('/').pop().split('?')[0];
  console.log(`   Source Database: ${sourceDb}`);
}

if (process.env.MONGO_URI_RESULTS) {
  const resultsDb = process.env.MONGO_URI_RESULTS.split('/').pop().split('?')[0];
  console.log(`   Results Database: ${resultsDb}`);
  
  if (resultsDb === 'Bandhan_wpd_report') {
    console.log('   ✅ Results database is correct: Bandhan_wpd_report');
  } else {
    console.log(`   ❌ Results database is wrong: ${resultsDb} (should be Bandhan_wpd_report)`);
  }
}

console.log('\n📁 .env file contents:');
try {
  const fs = await import('fs');
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log(envContent);
} catch (error) {
  console.log('   ❌ .env file not found or cannot be read');
}

console.log('\n🎯 Summary:');
if (process.env.MONGO_URI_RESULTS && process.env.MONGO_URI_RESULTS.includes('Bandhan_wpd_report')) {
  console.log('   ✅ Configuration is correct');
  console.log('   ✅ Data should be stored in Bandhan_wpd_report database');
  console.log('   ✅ Collection should be "school students"');
} else {
  console.log('   ❌ Configuration needs to be fixed');
  console.log('   ❌ Data might be going to wrong database');
}
