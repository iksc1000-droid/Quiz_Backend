#!/usr/bin/env node
/**
 * Test Current Storage Location
 * Creates test data and tracks where it's actually stored
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const config = {
  resultsUri: process.env.MONGO_URI_RESULTS,
  quizId: process.env.QUIZ_ID || 'career_school_v1'
};

console.log('🧪 Testing Current Storage Location...\n');

async function testCurrentStorage() {
  try {
    console.log('📊 Current Configuration:');
    console.log(`   MONGO_URI_RESULTS: ${config.resultsUri ? 'Set' : 'Not set'}`);
    console.log(`   Quiz ID: ${config.quizId}`);
    
    if (config.resultsUri) {
      // Extract database name from URI
      const dbName = config.resultsUri.split('/').pop().split('?')[0];
      console.log(`   Target Database: ${dbName}`);
    }
    
    console.log('\n🔄 Testing with Live API...');
    
    const baseUrl = 'http://localhost:5000';
    
    // Register test user
    const testEmail = 'storage-test-' + Date.now() + '@example.com';
    console.log(`   Registering test user: ${testEmail}`);
    
    const registerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Storage Test User',
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
        name: 'Storage Test User',
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
    
    // Now search for this data in both possible databases
    console.log('\n🔍 Searching for test data...');
    
    // Check Bandhan_wpd_report database
    console.log('   Checking Bandhan_wpd_report database...');
    try {
      const resultsConn = await mongoose.createConnection(config.resultsUri);
      const collection = resultsConn.db.collection('school students');
      const foundInResults = await collection.findOne({ email: testEmail });
      
      if (foundInResults) {
        console.log('   ✅ FOUND in Bandhan_wpd_report > school students');
        console.log(`      Status: ${foundInResults.status}`);
        console.log(`      Answers: ${foundInResults.answers?.length || 0}`);
        console.log(`      Created: ${foundInResults.createdAt}`);
        
        // Clean up
        await collection.deleteOne({ email: testEmail });
        console.log('   ✅ Test data cleaned up from Bandhan_wpd_report');
      } else {
        console.log('   ❌ NOT found in Bandhan_wpd_report');
      }
      
      await resultsConn.close();
    } catch (error) {
      console.log(`   ❌ Error checking Bandhan_wpd_report: ${error.message}`);
    }
    
    // Check demo_test_answer database
    console.log('   Checking demo_test_answer database...');
    try {
      const demoConn = await mongoose.createConnection('mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/demo_test_answer?retryWrites=true&w=majority&appName=PsychometricCluster');
      const demoCollection = demoConn.db.collection('school students');
      const foundInDemo = await demoCollection.findOne({ email: testEmail });
      
      if (foundInDemo) {
        console.log('   ✅ FOUND in demo_test_answer > school students');
        console.log(`      Status: ${foundInDemo.status}`);
        console.log(`      Answers: ${foundInDemo.answers?.length || 0}`);
        console.log(`      Created: ${foundInDemo.createdAt}`);
        
        // Clean up
        await demoCollection.deleteOne({ email: testEmail });
        console.log('   ✅ Test data cleaned up from demo_test_answer');
      } else {
        console.log('   ❌ NOT found in demo_test_answer');
      }
      
      await demoConn.close();
    } catch (error) {
      console.log(`   ❌ Error checking demo_test_answer: ${error.message}`);
    }
    
    console.log('\n📊 Test Complete!');
    console.log('Check the results above to see where your data is actually being stored.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCurrentStorage().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
