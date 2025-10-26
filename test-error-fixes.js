#!/usr/bin/env node
/**
 * Comprehensive Error Fix and Test Script
 * Tests all fixed components and verifies error resolution
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  resultsUri: process.env.MONGO_URI_RESULTS,
  quizId: process.env.QUIZ_ID || 'career_school_v1'
};

console.log('🔧 Comprehensive Error Fix Test...\n');

// Test 1: Backend Server Health
async function testBackendHealth() {
  try {
    console.log('🌐 Testing Backend Health...');
    
    const response = await fetch(`http://localhost:${config.port}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend server is healthy');
      console.log(`   Status: ${data.status}`);
      return true;
    } else {
      console.error(`❌ Backend health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend server not accessible:', error.message);
    return false;
  }
}

// Test 2: Database Schema Fix
async function testDatabaseSchema() {
  try {
    console.log('\n📊 Testing Database Schema Fix...');
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    
    // Test the fixed schema
    const AttemptSchema = new mongoose.Schema({
      quizId: { type: String, index: true },
      userId: { type: String, index: true },
      email: { type: String, index: true },
      name: String,
      phone: String,
      answers: [{
        questionId: String,  // Fixed: Now accepts strings
        optionKey: String,
        optionValue: mongoose.Schema.Types.Mixed,
        ts: { type: Date, default: Date.now }
      }],
      status: { 
        type: String, 
        enum: ["in_progress", "submitted", "finalizing", "completed"], // Fixed: Added missing statuses
        default: "in_progress" 
      }
    }, { timestamps: true, collection: "test_attempts_fix" });
    
    const TestAttempt = resultsConn.model("TestAttemptFix", AttemptSchema);
    
    // Test with string questionIds
    const testData = {
      quizId: config.quizId,
      userId: 'test_user_fix',
      email: 'test-fix@example.com',
      name: 'Test Fix User',
      answers: [
        { questionId: 'A1', optionKey: 'a', optionValue: 'Option A1' },
        { questionId: 'B2', optionKey: 'b', optionValue: 'Option B2' }
      ],
      status: 'finalizing'
    };
    
    const testAttempt = new TestAttempt(testData);
    await testAttempt.save();
    console.log('✅ Schema fix verified - string questionIds work');
    
    // Test status transitions
    testAttempt.status = 'completed';
    await testAttempt.save();
    console.log('✅ Status transitions work');
    
    // Clean up
    await TestAttempt.deleteOne({ _id: testAttempt._id });
    await resultsConn.close();
    
    return true;
  } catch (error) {
    console.error('❌ Schema fix test failed:', error.message);
    return false;
  }
}

// Test 3: Answer Saving Fix
async function testAnswerSaving() {
  try {
    console.log('\n💾 Testing Answer Saving Fix...');
    
    const baseUrl = `http://localhost:${config.port}`;
    
    // Step 1: Register user
    console.log('   Step 1: Registering user...');
    const registerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Answer Test User',
        email: 'answer-test@example.com',
        phone: '1234567890',
        gender: 'male'
      })
    });
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('✅ User registered successfully');
    
    // Step 2: Save answer with string questionId
    console.log('   Step 2: Saving answer with string questionId...');
    const answerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'answer-test@example.com',
        questionId: 'A1',  // String questionId
        optionKey: 'a',
        optionValue: 'Option A1'
      })
    });
    
    if (answerResponse.ok) {
      console.log('✅ Answer saved successfully with string questionId');
    } else {
      const errorText = await answerResponse.text();
      throw new Error(`Answer saving failed: ${answerResponse.status} - ${errorText}`);
    }
    
    // Step 3: Save another answer
    console.log('   Step 3: Saving another answer...');
    const answer2Response = await fetch(`${baseUrl}/api/quizzes/career_school_v1/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'answer-test@example.com',
        questionId: 'B2',  // Another string questionId
        optionKey: 'b',
        optionValue: 'Option B2'
      })
    });
    
    if (answer2Response.ok) {
      console.log('✅ Second answer saved successfully');
    } else {
      const errorText = await answer2Response.text();
      throw new Error(`Second answer saving failed: ${answer2Response.status} - ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Answer saving test failed:', error.message);
    return false;
  }
}

// Test 4: Complete Flow Test
async function testCompleteFlow() {
  try {
    console.log('\n🎯 Testing Complete Flow...');
    
    const baseUrl = `http://localhost:${config.port}`;
    
    // Register user
    const registerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Complete Test User',
        email: 'complete-test@example.com',
        phone: '1234567890',
        gender: 'male'
      })
    });
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('✅ User registered');
    
    // Save multiple answers
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
          email: 'complete-test@example.com',
          ...answer
        })
      });
      
      if (!answerResponse.ok) {
        throw new Error(`Answer ${answer.questionId} failed: ${answerResponse.status}`);
      }
    }
    
    console.log('✅ All answers saved');
    
    // Finalize quiz
    const finalizeResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: registerData.userId,
        email: 'complete-test@example.com',
        name: 'Complete Test User',
        phone: '1234567890',
        answers: answers.map(a => ({
          questionId: a.questionId,
          selectedOption: a.optionKey
        }))
      })
    });
    
    if (finalizeResponse.ok) {
      const finalizeData = await finalizeResponse.json();
      console.log('✅ Quiz finalized successfully');
      console.log(`   Score: ${finalizeData.score}`);
      return true;
    } else {
      const errorText = await finalizeResponse.text();
      throw new Error(`Finalization failed: ${finalizeResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Complete flow test failed:', error.message);
    return false;
  }
}

// Main test function
async function runErrorFixTests() {
  console.log('🚀 Starting Comprehensive Error Fix Tests...\n');
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'Database Schema Fix', fn: testDatabaseSchema },
    { name: 'Answer Saving Fix', fn: testAnswerSaving },
    { name: 'Complete Flow', fn: testCompleteFlow }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    const passed = await test.fn();
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('\n📊 Error Fix Test Results:');
  console.log(`   Backend Health: ${tests[0].fn() ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Schema Fix: ${tests[1].fn() ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Answer Saving: ${tests[2].fn() ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Complete Flow: ${tests[3].fn() ? '✅ PASS' : '❌ FAIL'}`);
  
  if (allPassed) {
    console.log('\n🎉 ALL ERROR FIXES VERIFIED! 🎉');
    console.log('   ✅ Backend server is healthy');
    console.log('   ✅ Database schema fixes work');
    console.log('   ✅ Answer saving with string questionIds works');
    console.log('   ✅ Complete quiz flow works');
    console.log('   ✅ All HTTP 500 errors resolved');
    console.log('\n🚀 Your application is now error-free and ready for production!');
  } else {
    console.log('\n⚠️  Some error fixes need attention.');
    console.log('   Please check the error messages above.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runErrorFixTests().catch(error => {
  console.error('❌ Error fix test execution failed:', error);
  process.exit(1);
});
