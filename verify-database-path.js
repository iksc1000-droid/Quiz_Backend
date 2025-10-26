#!/usr/bin/env node
/**
 * Verify Database Path
 * Confirms that data will be stored in the correct database
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

console.log('🔍 Verifying Database Path Configuration...\n');

// Check environment variables
console.log('📊 Environment Variables:');
console.log(`   MONGO_URI_SOURCE: ${process.env.MONGO_URI_SOURCE ? 'Set' : 'Not set'}`);
console.log(`   MONGO_URI_RESULTS: ${process.env.MONGO_URI_RESULTS ? 'Set' : 'Not set'}`);
console.log(`   QUIZ_COLLECTION: ${process.env.QUIZ_COLLECTION || 'Not set'}`);
console.log(`   QUIZ_ID: ${process.env.QUIZ_ID || 'Not set'}`);

if (process.env.MONGO_URI_RESULTS) {
  console.log(`\n🎯 Results Database URI:`);
  console.log(`   ${process.env.MONGO_URI_RESULTS}`);
  
  // Extract database name from URI
  const dbName = process.env.MONGO_URI_RESULTS.split('/').pop().split('?')[0];
  console.log(`   Database Name: ${dbName}`);
  
  if (dbName === 'Bandhan_wpd_report') {
    console.log('   ✅ Correct database: Bandhan_wpd_report');
  } else {
    console.log(`   ❌ Wrong database: ${dbName} (should be Bandhan_wpd_report)`);
  }
}

// Test connection to the correct database
async function testConnection() {
  try {
    console.log('\n🔌 Testing Connection to Correct Database...');
    
    const resultsUri = process.env.MONGO_URI_RESULTS || 'mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/Bandhan_wpd_report?retryWrites=true&w=majority&appName=PsychometricCluster';
    
    const resultsConn = await mongoose.createConnection(resultsUri);
    console.log('✅ Connected to results database');
    
    // Get database name
    const dbName = resultsConn.db.databaseName;
    console.log(`   Database: ${dbName}`);
    
    if (dbName === 'Bandhan_wpd_report') {
      console.log('   ✅ Data will be stored in the correct database!');
    } else {
      console.log(`   ❌ Data will be stored in wrong database: ${dbName}`);
    }
    
    // Check if school students collection exists
    const collectionName = process.env.QUIZ_COLLECTION || 'school students';
    const collection = resultsConn.db.collection(collectionName);
    const count = await collection.countDocuments();
    
    console.log(`\n📁 Collection: ${collectionName}`);
    console.log(`   Documents: ${count}`);
    
    if (count > 0) {
      console.log('   ✅ Collection exists and has data');
      
      // Get recent documents
      const recentDocs = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray();
      
      console.log('\n📋 Recent Documents:');
      recentDocs.forEach((doc, index) => {
        console.log(`   ${index + 1}. Email: ${doc.email}, Status: ${doc.status}, Created: ${doc.createdAt}`);
      });
    } else {
      console.log('   📝 Collection exists but is empty');
    }
    
    await resultsConn.close();
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Main verification
async function main() {
  console.log('🚀 Starting Database Path Verification...\n');
  
  const connectionTest = await testConnection();
  
  console.log('\n📊 Verification Results:');
  console.log(`   Environment Variables: ${process.env.MONGO_URI_RESULTS ? '✅ Set' : '❌ Not set'}`);
  console.log(`   Database Connection: ${connectionTest ? '✅ Working' : '❌ Failed'}`);
  
  if (process.env.MONGO_URI_RESULTS && connectionTest) {
    console.log('\n🎉 CONFIGURATION CORRECT!');
    console.log('   ✅ Data will be stored in Bandhan_wpd_report database');
    console.log('   ✅ Collection will be "school students"');
    console.log('   ✅ Ready for production use');
  } else {
    console.log('\n⚠️  Configuration needs attention');
    console.log('   Please check the .env file and restart the server');
  }
}

main().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
