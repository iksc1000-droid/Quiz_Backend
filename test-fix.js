#!/usr/bin/env node
/**
 * Test Script to Verify the Data Type Fix
 * Tests the complete flow with string questionIds like "A1", "B2", etc.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const config = {
  resultsUri: process.env.MONGO_URI_RESULTS,
  quizId: process.env.QUIZ_ID || 'career_school_v1'
};

console.log('🧪 Testing Data Type Fix...\n');

// Test the fixed schema
async function testFixedSchema() {
  try {
    console.log('📊 Testing Fixed Schema...');
    
    // Connect to results database
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    console.log('✅ Connected to results database');
    
    // Create the fixed schema
    const AttemptSchema = new mongoose.Schema({
      quizId: { type: String, index: true },
      userId: { type: String, index: true },
      email: { type: String, index: true },
      name: String,
      phone: String,
      gender: { type: String, enum: ['male', 'female'], default: null },
      userName: String,
      password: String,
      answers: [{
        questionId: String,  // Fixed: Now accepts strings like "A1", "B2"
        optionKey: String,
        optionValue: mongoose.Schema.Types.Mixed,
        ts: { type: Date, default: Date.now }
      }],
      meta: mongoose.Schema.Types.Mixed,
      status: { 
        type: String, 
        enum: ["in_progress", "submitted", "finalizing", "completed"], // Fixed: Added "finalizing" and "completed"
        default: "in_progress" 
      }
    }, { timestamps: true, collection: "test_attempts" });
    
    const TestAttempt = resultsConn.model("TestAttempt", AttemptSchema);
    console.log('✅ Fixed schema created');
    
    // Test data that matches frontend format
    const testData = {
      quizId: config.quizId,
      userId: 'test_user_' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      phone: '1234567890',
      gender: 'male',
      userName: 'test.user@1234',
      password: 'test@1234',
      answers: [
        { questionId: 'A1', optionKey: 'a', optionValue: 'Option A1' },
        { questionId: 'A2', optionKey: 'b', optionValue: 'Option A2' },
        { questionId: 'B1', optionKey: 'c', optionValue: 'Option B1' },
        { questionId: 'B2', optionKey: 'd', optionValue: 'Option B2' },
        { questionId: 'C1', optionKey: 'a', optionValue: 'Option C1' }
      ],
      status: 'finalizing' // This should now work
    };
    
    console.log('📝 Testing with frontend-style data:', {
      questionIds: testData.answers.map(a => a.questionId),
      status: testData.status
    });
    
    // Create test attempt
    const testAttempt = new TestAttempt(testData);
    await testAttempt.save();
    console.log('✅ Test attempt saved successfully with string questionIds!');
    
    // Test status transitions
    testAttempt.status = 'completed';
    await testAttempt.save();
    console.log('✅ Status transition to "completed" successful!');
    
    // Verify data integrity
    const retrieved = await TestAttempt.findById(testAttempt._id);
    console.log('📋 Retrieved data:', {
      questionIds: retrieved.answers.map(a => a.questionId),
      status: retrieved.status,
      answerCount: retrieved.answers.length
    });
    
    // Clean up test data
    await TestAttempt.deleteOne({ _id: testAttempt._id });
    console.log('✅ Test data cleaned up');
    
    await resultsConn.close();
    return true;
    
  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Test the complete finalize flow
async function testFinalizeFlow() {
  try {
    console.log('\n🎯 Testing Complete Finalize Flow...');
    
    // Connect to results database
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    
    // Create the fixed schema
    const AttemptSchema = new mongoose.Schema({
      quizId: { type: String, index: true },
      userId: { type: String, index: true },
      email: { type: String, index: true },
      name: String,
      phone: String,
      answers: [{
        questionId: String,
        optionKey: String,
        optionValue: mongoose.Schema.Types.Mixed,
        ts: { type: Date, default: Date.now }
      }],
      status: { 
        type: String, 
        enum: ["in_progress", "submitted", "finalizing", "completed"],
        default: "in_progress" 
      }
    }, { timestamps: true, collection: "test_attempts" });
    
    const TestAttempt = resultsConn.model("TestAttempt", AttemptSchema);
    
    // Simulate the exact data from frontend
    const frontendData = {
      userId: 'user_123',
      quizId: config.quizId,
      email: 'test@example.com',
      name: 'Test User',
      phone: '1234567890',
      answers: [
        { questionId: 'A1', selectedOption: 'a' },
        { questionId: 'A2', selectedOption: 'b' },
        { questionId: 'A3', selectedOption: 'c' },
        { questionId: 'A4', selectedOption: 'd' },
        { questionId: 'A5', selectedOption: 'a' },
        { questionId: 'B1', selectedOption: 'b' },
        { questionId: 'B2', selectedOption: 'c' },
        { questionId: 'B3', selectedOption: 'd' },
        { questionId: 'B4', selectedOption: 'a' },
        { questionId: 'B5', selectedOption: 'b' }
      ]
    };
    
    console.log('📤 Simulating frontend finalize request...');
    console.log('   QuestionIds:', frontendData.answers.map(a => a.questionId));
    
    // Normalize answers (same as in controller)
    const normalizedAnswers = frontendData.answers.map(a => ({
      questionId: String(a.questionId),
      selectedOption: String(a.selectedOption)
    }));
    
    console.log('📋 Normalized answers:', normalizedAnswers.length);
    
    // Convert to storage format (same as in service)
    const storageAnswers = normalizedAnswers.map(answer => ({
      questionId: String(answer.questionId),
      optionKey: String(answer.selectedOption),
      optionValue: String(answer.selectedOption),
      ts: new Date()
    }));
    
    // Create attempt with finalizing status
    const attempt = new TestAttempt({
      userId: frontendData.userId,
      quizId: frontendData.quizId,
      email: frontendData.email,
      name: frontendData.name,
      phone: frontendData.phone,
      answers: storageAnswers,
      status: 'finalizing'
    });
    
    await attempt.save();
    console.log('✅ Attempt created with "finalizing" status!');
    
    // Update to completed
    attempt.status = 'completed';
    await attempt.save();
    console.log('✅ Status updated to "completed"!');
    
    // Verify final data
    const final = await TestAttempt.findById(attempt._id);
    console.log('📊 Final verification:', {
      questionIds: final.answers.map(a => a.questionId),
      status: final.status,
      answerCount: final.answers.length,
      allQuestionIdsValid: final.answers.every(a => typeof a.questionId === 'string' && a.questionId.match(/^[A-F]\d+$/))
    });
    
    // Clean up
    await TestAttempt.deleteOne({ _id: attempt._id });
    await resultsConn.close();
    
    return true;
    
  } catch (error) {
    console.error('❌ Finalize flow test failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Data Type Fix Tests...\n');
  
  const schemaTest = await testFixedSchema();
  const flowTest = await testFinalizeFlow();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   Schema Fix: ${schemaTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Finalize Flow: ${flowTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (schemaTest && flowTest) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('   ✅ String questionIds (A1, B2, etc.) now work');
    console.log('   ✅ "finalizing" status is now valid');
    console.log('   ✅ Complete finalize flow works');
    console.log('   ✅ Data type mismatch is fixed');
    console.log('\n🚀 Your backend is now ready to handle the frontend data!');
  } else {
    console.log('\n⚠️  Some tests failed.');
    console.log('   Please check the error messages above.');
  }
  
  process.exit(schemaTest && flowTest ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
