import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const testCompleteFlow = async () => {
  console.log('🧪 TESTING COMPLETE QUIZ FLOW...\n');
  
  const testEmail = `test_${Date.now()}@example.com`;
  const testName = 'Test User';
  const testPhone = '9876543210';
  
  try {
    // Step 1: Register user
    console.log('1️⃣ Registering user...');
    const registerResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        phone: testPhone
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);
    
    if (!registerData.success) {
      throw new Error('Registration failed: ' + registerData.message);
    }
    
    // Step 2: Save some sample answers
    console.log('\n2️⃣ Saving sample answers...');
    const sampleAnswers = [
      { questionId: 1, optionKey: 'a', optionValue: 'Strongly Agree' },
      { questionId: 2, optionKey: 'b', optionValue: 'Agree' },
      { questionId: 3, optionKey: 'c', optionValue: 'Neutral' },
      { questionId: 4, optionKey: 'a', optionValue: 'Disagree' },
      { questionId: 5, optionKey: 'b', optionValue: 'Strongly Disagree' }
    ];
    
    for (const answer of sampleAnswers) {
      const answerResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          ...answer
        })
      });
      
      const answerData = await answerResponse.json();
      console.log(`Answer ${answer.questionId}:`, answerData.success ? '✅' : '❌', answerData.message);
    }
    
    // Step 3: Finalize quiz
    console.log('\n3️⃣ Finalizing quiz...');
    const finalizeResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail
      })
    });
    
    const finalizeData = await finalizeResponse.json();
    console.log('Finalize response:', finalizeData);
    
    if (finalizeData.success) {
      console.log('\n✅ COMPLETE FLOW TEST SUCCESSFUL!');
      console.log('📧 Email should be sent to:', testEmail);
      console.log('📊 Result ID:', finalizeData.resultId);
      console.log('📈 Summary:', finalizeData.summary);
    } else {
      console.log('\n❌ Finalization failed:', finalizeData.message);
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
};

testCompleteFlow();