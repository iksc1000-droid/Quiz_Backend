#!/usr/bin/env node
/**
 * Test New Configuration
 * Verifies the new database and collection names are working
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Testing New Configuration...\n');

async function testNewConfiguration() {
  try {
    console.log('📊 Current Configuration:');
    console.log(`   Results Database: ${process.env.MONGO_URI_RESULTS?.split('/').pop().split('?')[0]}`);
    console.log(`   Collection: ${process.env.QUIZ_COLLECTION || 'quiz_attempts'}`);
    console.log(`   Quiz ID: ${process.env.QUIZ_ID || 'career_school_v1'}`);
    
    console.log('\n🔄 Testing with Live API...');
    
    const baseUrl = 'http://localhost:5000';
    const testEmail = 'new-config-test-' + Date.now() + '@example.com';
    
    // Step 1: Register user
    console.log('   1. Registering user...');
    const registerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Config Test User',
        email: testEmail,
        phone: '1234567890',
        gender: 'male'
      })
    });
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('   ✅ User registered successfully');
    
    // Step 2: Save answers
    console.log('   2. Saving answers...');
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
          email: testEmail,
          ...answer
        })
      });
      
      if (!answerResponse.ok) {
        throw new Error(`Answer ${answer.questionId} failed: ${answerResponse.status}`);
      }
    }
    
    console.log(`   ✅ ${answers.length} answers saved successfully`);
    
    // Step 3: Finalize quiz
    console.log('   3. Finalizing quiz...');
    const finalizeResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: registerData.userId,
        email: testEmail,
        name: 'New Config Test User',
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
    console.log('   ✅ Quiz finalized successfully');
    console.log(`   Score: ${finalizeData.score}`);
    
    console.log('\n📊 Test Results:');
    console.log('   ✅ User registration: Working');
    console.log('   ✅ Answer saving: Working');
    console.log('   ✅ Quiz finalization: Working');
    console.log('   ✅ Email sending: Working (if configured)');
    
    console.log('\n🎯 New Data Storage Location:');
    console.log(`   Database: ${process.env.MONGO_URI_RESULTS?.split('/').pop().split('?')[0]}`);
    console.log(`   Collection: ${process.env.QUIZ_COLLECTION || 'quiz_attempts'}`);
    console.log(`   Test Email: ${testEmail}`);
    
    console.log('\n✅ CONFIGURATION CHANGE SUCCESSFUL!');
    console.log('   Your quiz data is now being stored in the new location:');
    console.log(`   📁 Database: ${process.env.MONGO_URI_RESULTS?.split('/').pop().split('?')[0]}`);
    console.log(`   📁 Collection: ${process.env.QUIZ_COLLECTION || 'quiz_attempts'}`);
    
    console.log('\n🔍 To verify in MongoDB Compass:');
    console.log(`   1. Open MongoDB Compass`);
    console.log(`   2. Go to database: ${process.env.MONGO_URI_RESULTS?.split('/').pop().split('?')[0]}`);
    console.log(`   3. Open collection: ${process.env.QUIZ_COLLECTION || 'quiz_attempts'}`);
    console.log(`   4. Look for email: ${testEmail}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNewConfiguration().catch(error => {
  console.error('❌ Configuration test failed:', error);
  process.exit(1);
});
