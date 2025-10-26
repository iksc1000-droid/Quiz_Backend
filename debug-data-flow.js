import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const debugDataFlow = async () => {
  console.log('🔍 DEBUGGING DATA FLOW...\n');
  
  const testEmail = `debug_${Date.now()}@example.com`;
  const testName = 'Debug User';
  const testPhone = '9876543210';
  
  try {
    // Step 1: Register user with detailed logging
    console.log('1️⃣ Registering user...');
    console.log('Data being sent:', { name: testName, email: testEmail, phone: testPhone });
    
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
    console.log('Register response:', JSON.stringify(registerData, null, 2));
    
    if (!registerData.success) {
      throw new Error('Registration failed: ' + registerData.message);
    }
    
    // Step 2: Save one answer with detailed logging
    console.log('\n2️⃣ Saving one answer...');
    const answerData = {
      email: testEmail,
      questionId: 1,
      optionKey: 'a',
      optionValue: 'Strongly Agree'
    };
    
    console.log('Answer data being sent:', answerData);
    
    const answerResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answerData)
    });
    
    const answerResult = await answerResponse.json();
    console.log('Answer response:', JSON.stringify(answerResult, null, 2));
    
    // Step 3: Finalize with detailed logging
    console.log('\n3️⃣ Finalizing quiz...');
    const finalizeData = { email: testEmail };
    console.log('Finalize data being sent:', finalizeData);
    
    const finalizeResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalizeData)
    });
    
    const finalizeResult = await finalizeResponse.json();
    console.log('Finalize response:', JSON.stringify(finalizeResult, null, 2));
    
    console.log('\n✅ DEBUG COMPLETED');
    
  } catch (error) {
    console.error('\n❌ DEBUG FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
};

debugDataFlow();


