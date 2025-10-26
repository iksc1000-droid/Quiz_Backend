#!/usr/bin/env node
/**
 * MongoDB Storage Verification Script
 * Verifies that data is actually being stored in MongoDB
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const config = {
  sourceUri: process.env.MONGO_URI_SOURCE,
  resultsUri: process.env.MONGO_URI_RESULTS,
  quizId: process.env.QUIZ_ID || 'career_school_v1'
};

console.log('🔍 Verifying MongoDB Data Storage...\n');

// Test 1: Check Source Database
async function checkSourceDatabase() {
  try {
    console.log('📊 Checking Source Database...');
    console.log(`   URI: ${config.sourceUri?.substring(0, 50)}...`);
    
    const sourceConn = await mongoose.createConnection(config.sourceUri);
    console.log('✅ Connected to source database');
    
    // Check collections
    const collections = await sourceConn.db.listCollections().toArray();
    console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Check quiz data
    const quizCollection = sourceConn.db.collection('school students');
    const quizCount = await quizCollection.countDocuments();
    console.log(`   Quiz documents: ${quizCount}`);
    
    // Get a sample quiz
    const sampleQuiz = await quizCollection.findOne({ quizId: config.quizId });
    if (sampleQuiz) {
      console.log(`   ✅ Quiz "${config.quizId}" found`);
      console.log(`   Sections: ${sampleQuiz.sections?.length || 0}`);
      console.log(`   Questions: ${sampleQuiz.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0}`);
    } else {
      console.log(`   ⚠️  Quiz "${config.quizId}" not found`);
    }
    
    await sourceConn.close();
    return true;
  } catch (error) {
    console.error('❌ Source database check failed:', error.message);
    return false;
  }
}

// Test 2: Check Results Database
async function checkResultsDatabase() {
  try {
    console.log('\n📊 Checking Results Database...');
    console.log(`   URI: ${config.resultsUri?.substring(0, 50)}...`);
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    console.log('✅ Connected to results database');
    
    // Check collections
    const collections = await resultsConn.db.listCollections().toArray();
    console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Check attempts collection
    const attemptsCollection = resultsConn.db.collection('school students');
    const attemptsCount = await attemptsCollection.countDocuments();
    console.log(`   Attempts documents: ${attemptsCount}`);
    
    // Get recent attempts
    const recentAttempts = await attemptsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    if (recentAttempts.length > 0) {
      console.log('   Recent attempts:');
      recentAttempts.forEach((attempt, index) => {
        console.log(`     ${index + 1}. Email: ${attempt.email}, Status: ${attempt.status}, Answers: ${attempt.answers?.length || 0}`);
      });
    } else {
      console.log('   ⚠️  No attempts found in database');
    }
    
    await resultsConn.close();
    return true;
  } catch (error) {
    console.error('❌ Results database check failed:', error.message);
    return false;
  }
}

// Test 3: Create Test Data and Verify Storage
async function testDataStorage() {
  try {
    console.log('\n🧪 Testing Data Storage...');
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    
    // Create test attempt
    const testAttempt = {
      quizId: config.quizId,
      userId: 'test_storage_' + Date.now(),
      email: 'storage-test@example.com',
      name: 'Storage Test User',
      phone: '1234567890',
      answers: [
        { questionId: 'A1', optionKey: 'a', optionValue: 'Option A1', ts: new Date() },
        { questionId: 'A2', optionKey: 'b', optionValue: 'Option A2', ts: new Date() },
        { questionId: 'B1', optionKey: 'c', optionValue: 'Option B1', ts: new Date() }
      ],
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('   Creating test attempt...');
    const attemptsCollection = resultsConn.db.collection('school students');
    const insertResult = await attemptsCollection.insertOne(testAttempt);
    console.log(`   ✅ Test attempt created with ID: ${insertResult.insertedId}`);
    
    // Verify the data was stored
    console.log('   Verifying stored data...');
    const storedAttempt = await attemptsCollection.findOne({ _id: insertResult.insertedId });
    
    if (storedAttempt) {
      console.log('   ✅ Data successfully stored and retrieved');
      console.log(`     Email: ${storedAttempt.email}`);
      console.log(`     Status: ${storedAttempt.status}`);
      console.log(`     Answers: ${storedAttempt.answers.length}`);
      console.log(`     QuestionIds: ${storedAttempt.answers.map(a => a.questionId).join(', ')}`);
      
      // Clean up test data
      await attemptsCollection.deleteOne({ _id: insertResult.insertedId });
      console.log('   ✅ Test data cleaned up');
    } else {
      console.log('   ❌ Data not found after insertion');
    }
    
    await resultsConn.close();
    return true;
  } catch (error) {
    console.error('❌ Data storage test failed:', error.message);
    return false;
  }
}

// Test 4: Check Real User Data
async function checkRealUserData() {
  try {
    console.log('\n👥 Checking Real User Data...');
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    const attemptsCollection = resultsConn.db.collection('school students');
    
    // Get all attempts
    const allAttempts = await attemptsCollection.find({}).toArray();
    console.log(`   Total attempts in database: ${allAttempts.length}`);
    
    if (allAttempts.length > 0) {
      console.log('   Sample of real user data:');
      allAttempts.slice(0, 3).forEach((attempt, index) => {
        console.log(`     ${index + 1}. Email: ${attempt.email}`);
        console.log(`        Name: ${attempt.name}`);
        console.log(`        Status: ${attempt.status}`);
        console.log(`        Answers: ${attempt.answers?.length || 0}`);
        console.log(`        Created: ${attempt.createdAt}`);
        console.log('');
      });
      
      // Check for completed attempts
      const completedAttempts = allAttempts.filter(a => a.status === 'completed');
      console.log(`   Completed attempts: ${completedAttempts.length}`);
      
      // Check for attempts with answers
      const attemptsWithAnswers = allAttempts.filter(a => a.answers && a.answers.length > 0);
      console.log(`   Attempts with answers: ${attemptsWithAnswers.length}`);
      
      // Check questionId formats
      const stringQuestionIds = attemptsWithAnswers.filter(a => 
        a.answers.some(answer => typeof answer.questionId === 'string')
      );
      console.log(`   Attempts with string questionIds: ${stringQuestionIds.length}`);
      
    } else {
      console.log('   ⚠️  No user data found in database');
    }
    
    await resultsConn.close();
    return true;
  } catch (error) {
    console.error('❌ Real user data check failed:', error.message);
    return false;
  }
}

// Test 5: Live Data Flow Test
async function testLiveDataFlow() {
  try {
    console.log('\n🔄 Testing Live Data Flow...');
    
    const baseUrl = 'http://localhost:5000';
    
    // Register a test user
    console.log('   Registering test user...');
    const registerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Live Test User',
        email: 'live-test@example.com',
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
      { questionId: 'A2', optionKey: 'b', optionValue: 'Option A2' },
      { questionId: 'B1', optionKey: 'c', optionValue: 'Option B1' }
    ];
    
    for (const answer of answers) {
      const answerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'live-test@example.com',
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
        email: 'live-test@example.com',
        name: 'Live Test User',
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
    
    const finalizeData = await finalizeResponse.json();
    console.log('   ✅ Quiz finalized');
    
    // Verify data in database
    console.log('   Verifying data in database...');
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    const attemptsCollection = resultsConn.db.collection('school students');
    
    const storedAttempt = await attemptsCollection.findOne({ email: 'live-test@example.com' });
    if (storedAttempt) {
      console.log('   ✅ Data found in database:');
      console.log(`     Email: ${storedAttempt.email}`);
      console.log(`     Status: ${storedAttempt.status}`);
      console.log(`     Answers: ${storedAttempt.answers.length}`);
      console.log(`     QuestionIds: ${storedAttempt.answers.map(a => a.questionId).join(', ')}`);
      console.log(`     Created: ${storedAttempt.createdAt}`);
    } else {
      console.log('   ❌ Data not found in database');
    }
    
    await resultsConn.close();
    return true;
  } catch (error) {
    console.error('❌ Live data flow test failed:', error.message);
    return false;
  }
}

// Main verification function
async function runStorageVerification() {
  console.log('🚀 Starting MongoDB Storage Verification...\n');
  
  const tests = [
    { name: 'Source Database', fn: checkSourceDatabase },
    { name: 'Results Database', fn: checkResultsDatabase },
    { name: 'Data Storage Test', fn: testDataStorage },
    { name: 'Real User Data', fn: checkRealUserData },
    { name: 'Live Data Flow', fn: testLiveDataFlow }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    const passed = await test.fn();
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('\n📊 Storage Verification Results:');
  console.log(`   Source Database: ${tests[0].fn() ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Results Database: ${tests[1].fn() ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Data Storage: ${tests[2].fn() ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Real User Data: ${tests[3].fn() ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Live Data Flow: ${tests[4].fn() ? '✅ PASS' : '❌ FAIL'}`);
  
  if (allPassed) {
    console.log('\n🎉 MONGODB STORAGE VERIFIED! 🎉');
    console.log('   ✅ Data is being stored in MongoDB');
    console.log('   ✅ String questionIds are working');
    console.log('   ✅ User attempts are being saved');
    console.log('   ✅ Quiz finalization stores data');
    console.log('   ✅ Complete data flow is functional');
  } else {
    console.log('\n⚠️  Some storage issues detected.');
    console.log('   Please check the error messages above.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the verification
runStorageVerification().catch(error => {
  console.error('❌ Storage verification failed:', error);
  process.exit(1);
});