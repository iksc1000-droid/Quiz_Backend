#!/usr/bin/env node
/**
 * Check Exact Data Location
 * Searches for data in the exact collection where it should be stored
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const config = {
  resultsUri: process.env.MONGO_URI_RESULTS,
  quizId: process.env.QUIZ_ID || 'career_school_v1'
};

console.log('🎯 Checking Exact Data Location...\n');

async function checkExactLocation() {
  try {
    console.log('📊 Connecting to Results Database...');
    console.log(`   URI: ${config.resultsUri?.substring(0, 60)}...`);
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    console.log('✅ Connected to results database');
    
    // Check the exact collection name from the model
    const collectionName = 'school students';
    console.log(`\n🔍 Checking collection: "${collectionName}"`);
    
    const collection = resultsConn.db.collection(collectionName);
    const totalCount = await collection.countDocuments();
    console.log(`   Total documents: ${totalCount}`);
    
    if (totalCount > 0) {
      console.log('\n📋 Recent Quiz Attempts:');
      
      // Get recent attempts
      const recentAttempts = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
      
      recentAttempts.forEach((attempt, index) => {
        console.log(`\n   ${index + 1}. User: ${attempt.name || 'N/A'}`);
        console.log(`      Email: ${attempt.email || 'N/A'}`);
        console.log(`      Status: ${attempt.status || 'N/A'}`);
        console.log(`      Quiz ID: ${attempt.quizId || 'N/A'}`);
        console.log(`      Answers: ${attempt.answers?.length || 0}`);
        console.log(`      Created: ${attempt.createdAt || 'N/A'}`);
        console.log(`      Updated: ${attempt.updatedAt || 'N/A'}`);
        
        if (attempt.answers && attempt.answers.length > 0) {
          console.log(`      Question IDs: ${attempt.answers.map(a => a.questionId).join(', ')}`);
        }
      });
      
      // Check for completed attempts
      const completedCount = await collection.countDocuments({ status: 'completed' });
      console.log(`\n📊 Statistics:`);
      console.log(`   Completed attempts: ${completedCount}`);
      console.log(`   In-progress attempts: ${await collection.countDocuments({ status: 'in_progress' })}`);
      console.log(`   Finalizing attempts: ${await collection.countDocuments({ status: 'finalizing' })}`);
      
      // Check for attempts with answers
      const withAnswersCount = await collection.countDocuments({ 
        answers: { $exists: true, $not: { $size: 0 } } 
      });
      console.log(`   Attempts with answers: ${withAnswersCount}`);
      
    } else {
      console.log('   ❌ No data found in this collection');
      
      // Check if collection exists at all
      const collections = await resultsConn.db.listCollections().toArray();
      console.log(`\n📁 Available collections in this database:`);
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    await resultsConn.close();
    return true;
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    return false;
  }
}

async function checkDatabaseInfo() {
  try {
    console.log('\n🔍 Database Information:');
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    
    // Get database name
    const dbName = resultsConn.db.databaseName;
    console.log(`   Database Name: ${dbName}`);
    
    // Get connection info
    const admin = resultsConn.db.admin();
    const serverStatus = await admin.serverStatus();
    console.log(`   MongoDB Version: ${serverStatus.version}`);
    console.log(`   Host: ${resultsConn.host}`);
    console.log(`   Port: ${resultsConn.port}`);
    
    await resultsConn.close();
    
  } catch (error) {
    console.error('❌ Database info check failed:', error.message);
  }
}

async function createTestAndVerify() {
  try {
    console.log('\n🧪 Creating Test Data to Verify Location...');
    
    const baseUrl = 'http://localhost:5000';
    
    // Register test user
    const testEmail = 'location-test@example.com';
    console.log(`   Registering test user: ${testEmail}`);
    
    const registerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Location Test User',
        email: testEmail,
        phone: '1234567890',
        gender: 'male'
      })
    });
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('   ✅ User registered');
    
    // Save answers
    console.log('   Saving answers...');
    const answers = [
      { questionId: 'A1', optionKey: 'a', optionValue: 'Option A1' },
      { questionId: 'A2', optionKey: 'b', optionValue: 'Option A2' }
    ];
    
    for (const answer of answers) {
      const answerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          ...answer
        })
      });
      
      if (!answerResponse.ok) {
        throw new Error(`Answer ${answer.questionId} failed: ${answerResponse.status}`);
      }
    }
    
    console.log('   ✅ Answers saved');
    
    // Finalize quiz
    console.log('   Finalizing quiz...');
    const finalizeResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: registerData.userId,
        email: testEmail,
        name: 'Location Test User',
        phone: '1234567890',
        answers: answers.map(a => ({
          questionId: a.questionId,
          selectedOption: a.optionKey
        }))
      })
    });
    
    if (!finalizeResponse.ok) {
      throw new Error(`Finalization failed: ${finalizeResponse.status}`);
    }
    
    console.log('   ✅ Quiz finalized');
    
    // Now check if this data appears in the database
    console.log('   🔍 Verifying data in database...');
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    const collection = resultsConn.db.collection('school students');
    
    const testData = await collection.findOne({ email: testEmail });
    
    if (testData) {
      console.log('   ✅ TEST DATA FOUND!');
      console.log(`      Email: ${testData.email}`);
      console.log(`      Status: ${testData.status}`);
      console.log(`      Answers: ${testData.answers.length}`);
      console.log(`      Created: ${testData.createdAt}`);
      console.log(`      Collection: school students`);
      console.log(`      Database: ${resultsConn.db.databaseName}`);
      
      // Clean up
      await collection.deleteOne({ email: testEmail });
      console.log('   ✅ Test data cleaned up');
    } else {
      console.log('   ❌ Test data not found in expected location');
    }
    
    await resultsConn.close();
    
  } catch (error) {
    console.error('❌ Test verification failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Exact Location Check...\n');
  
  await checkDatabaseInfo();
  await checkExactLocation();
  await createTestAndVerify();
  
  console.log('\n📊 Location Check Complete!');
  console.log('Your quiz data should be in the "school students" collection.');
  console.log('If you still can\'t find it, check the MongoDB Atlas dashboard.');
}

main().catch(error => {
  console.error('❌ Location check failed:', error);
  process.exit(1);
});
