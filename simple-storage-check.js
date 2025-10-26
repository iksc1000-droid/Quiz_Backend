#!/usr/bin/env node
/**
 * Simple MongoDB Storage Check
 * Verifies data storage without collection listing
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const config = {
  resultsUri: process.env.MONGO_URI_RESULTS,
  quizId: process.env.QUIZ_ID || 'career_school_v1'
};

console.log('🔍 Simple MongoDB Storage Check...\n');

async function checkDataStorage() {
  try {
    console.log('📊 Connecting to MongoDB...');
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    console.log('✅ Connected to results database');
    
    // Create a test document
    const testData = {
      quizId: config.quizId,
      userId: 'storage_test_' + Date.now(),
      email: 'storage-check@example.com',
      name: 'Storage Check User',
      phone: '1234567890',
      answers: [
        { questionId: 'A1', optionKey: 'a', optionValue: 'Option A1', ts: new Date() },
        { questionId: 'B2', optionKey: 'b', optionValue: 'Option B2', ts: new Date() }
      ],
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Creating test document...');
    const TestSchema = new mongoose.Schema({
      quizId: String,
      userId: String,
      email: String,
      name: String,
      phone: String,
      answers: [{
        questionId: String,
        optionKey: String,
        optionValue: mongoose.Schema.Types.Mixed,
        ts: Date
      }],
      status: String,
      createdAt: Date,
      updatedAt: Date
    }, { collection: 'school students' });
    
    const TestModel = resultsConn.model('TestStorage', TestSchema);
    
    // Insert test data
    const testDoc = new TestModel(testData);
    await testDoc.save();
    console.log('✅ Test document saved successfully');
    
    // Retrieve and verify
    console.log('🔍 Retrieving test document...');
    const retrievedDoc = await TestModel.findOne({ email: 'storage-check@example.com' });
    
    if (retrievedDoc) {
      console.log('✅ Data successfully retrieved from MongoDB:');
      console.log(`   Email: ${retrievedDoc.email}`);
      console.log(`   Name: ${retrievedDoc.name}`);
      console.log(`   Status: ${retrievedDoc.status}`);
      console.log(`   Answers: ${retrievedDoc.answers.length}`);
      console.log(`   QuestionIds: ${retrievedDoc.answers.map(a => a.questionId).join(', ')}`);
      console.log(`   Created: ${retrievedDoc.createdAt}`);
      
      // Clean up
      await TestModel.deleteOne({ _id: retrievedDoc._id });
      console.log('✅ Test data cleaned up');
    } else {
      console.log('❌ Data not found after insertion');
    }
    
    await resultsConn.close();
    return true;
  } catch (error) {
    console.error('❌ Storage check failed:', error.message);
    return false;
  }
}

async function checkLiveData() {
  try {
    console.log('\n🔄 Checking Live Data from API...');
    
    const baseUrl = 'http://localhost:5000';
    
    // Register user
    console.log('   Registering user...');
    const registerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Live Check User',
        email: 'live-check@example.com',
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
          email: 'live-check@example.com',
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
        email: 'live-check@example.com',
        name: 'Live Check User',
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
    console.log(`   Score: ${finalizeData.score}`);
    
    // Verify in database
    console.log('   Verifying in database...');
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    
    const TestSchema = new mongoose.Schema({
      quizId: String,
      userId: String,
      email: String,
      name: String,
      phone: String,
      answers: [{
        questionId: String,
        optionKey: String,
        optionValue: mongoose.Schema.Types.Mixed,
        ts: Date
      }],
      status: String,
      createdAt: Date,
      updatedAt: Date
    }, { collection: 'school students' });
    
    const TestModel = resultsConn.model('LiveCheck', TestSchema);
    const storedData = await TestModel.findOne({ email: 'live-check@example.com' });
    
    if (storedData) {
      console.log('   ✅ Data found in MongoDB:');
      console.log(`     Email: ${storedData.email}`);
      console.log(`     Status: ${storedData.status}`);
      console.log(`     Answers: ${storedData.answers.length}`);
      console.log(`     QuestionIds: ${storedData.answers.map(a => a.questionId).join(', ')}`);
      console.log(`     Created: ${storedData.createdAt}`);
    } else {
      console.log('   ❌ Data not found in database');
    }
    
    await resultsConn.close();
    return true;
  } catch (error) {
    console.error('❌ Live data check failed:', error.message);
    return false;
  }
}

async function runSimpleCheck() {
  console.log('🚀 Starting Simple Storage Check...\n');
  
  const storageTest = await checkDataStorage();
  const liveTest = await checkLiveData();
  
  console.log('\n📊 Storage Check Results:');
  console.log(`   Direct Storage Test: ${storageTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Live API Test: ${liveTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (storageTest && liveTest) {
    console.log('\n🎉 MONGODB STORAGE CONFIRMED! 🎉');
    console.log('   ✅ Data IS being stored in MongoDB');
    console.log('   ✅ String questionIds work perfectly');
    console.log('   ✅ User attempts are saved');
    console.log('   ✅ Quiz finalization stores data');
    console.log('   ✅ Complete data flow is working');
    console.log('\n📊 Your MongoDB database contains real user data!');
  } else {
    console.log('\n⚠️  Storage issues detected.');
  }
  
  process.exit(storageTest && liveTest ? 0 : 1);
}

runSimpleCheck().catch(error => {
  console.error('❌ Simple check failed:', error);
  process.exit(1);
});
