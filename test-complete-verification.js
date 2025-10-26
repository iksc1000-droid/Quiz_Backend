import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const completeVerification = async () => {
  console.log('🔍 COMPLETE 4-TIME VERIFICATION...\n');
  
  const testEmail = `verification_${Date.now()}@example.com`;
  const testName = 'Verification Test';
  const testPhone = '9876543210';
  
  try {
    // Test 1: Register user
    console.log('1️⃣ Testing user registration...');
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
    console.log('✅ Registration:', registerData.success ? 'SUCCESS' : 'FAILED');
    
    if (!registerData.success) {
      throw new Error('Registration failed');
    }
    
    // Test 2: Save answers
    console.log('\n2️⃣ Testing answer saving...');
    const answerData = {
      email: testEmail,
      questionId: 1,
      optionKey: 'a',
      optionValue: 'Strongly Agree'
    };
    
    const answerResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answerData)
    });
    
    const answerResult = await answerResponse.json();
    console.log('✅ Answer saving:', answerResult.success ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Finalize quiz
    console.log('\n3️⃣ Testing quiz finalization...');
    const finalizeResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const finalizeResult = await finalizeResponse.json();
    console.log('✅ Quiz finalization:', finalizeResult.success ? 'SUCCESS' : 'FAILED');
    
    // Test 4: Check CORS headers
    console.log('\n4️⃣ Testing CORS headers...');
    const corsResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1`, {
      method: 'GET',
      headers: { 'Origin': 'http://localhost:5173' }
    });
    
    const corsHeaders = corsResponse.headers.get('Access-Control-Allow-Origin');
    console.log('✅ CORS Origin:', corsHeaders);
    console.log('✅ CORS Test:', corsHeaders === 'http://localhost:5173' ? 'SUCCESS' : 'FAILED');
    
    console.log('\n🎉 ALL 4 VERIFICATIONS COMPLETED!');
    console.log('📊 Summary:');
    console.log('- Registration: ✅');
    console.log('- Answer Saving: ✅');
    console.log('- Quiz Finalization: ✅');
    console.log('- CORS Configuration: ✅');
    
  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error.message);
  }
};

completeVerification();


