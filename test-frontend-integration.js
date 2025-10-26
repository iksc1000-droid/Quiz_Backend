import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const testFrontendIntegration = async () => {
  console.log('🧪 Testing Frontend Integration with Real User Data...\n');
  
  try {
    // Test with a real user email
    const testEmail = 'testuser@example.com';
    const testName = 'Test User';
    const testPhone = '9876543210';
    
    // Step 1: Register User (like frontend would do)
    console.log('1️⃣ Registering User (Frontend Simulation)...');
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
    if (!registerData.success) {
      throw new Error('User registration failed: ' + JSON.stringify(registerData));
    }
    console.log('✅ User registered:', registerData.email);
    
    // Step 2: Save Quiz Answers (like frontend would do)
    console.log('\n2️⃣ Saving Quiz Answers (Frontend Simulation)...');
    const answers = [
      { questionId: 1, optionKey: 'a', optionValue: 'Mobile & social media' },
      { questionId: 2, optionKey: 'b', optionValue: 'Bored and restless' },
      { questionId: 3, optionKey: 'c', optionValue: 'Social studies' },
      { questionId: 4, optionKey: 'a', optionValue: 'I prepare with confidence' },
      { questionId: 5, optionKey: 'b', optionValue: 'I ask a teacher/friend' },
      { questionId: 6, optionKey: 'c', optionValue: 'I feel overwhelmed' },
      { questionId: 7, optionKey: 'a', optionValue: 'Very confident' },
      { questionId: 8, optionKey: 'b', optionValue: 'Somewhat confident' },
      { questionId: 9, optionKey: 'c', optionValue: 'Not confident' },
      { questionId: 10, optionKey: 'a', optionValue: 'Always' }
    ];
    
    for (const answer of answers) {
      const answerResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          ...answer
        })
      });
      
      const answerData = await answerResponse.json();
      if (!answerData.success) {
        console.warn(`⚠️ Answer ${answer.questionId} failed:`, answerData.message);
      } else {
        console.log(`✅ Answer ${answer.questionId} saved`);
      }
    }
    
    // Step 3: Finalize Quiz (like frontend would do)
    console.log('\n3️⃣ Finalizing Quiz (Frontend Simulation)...');
    const finalizeResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail
      })
    });
    
    const finalizeData = await finalizeResponse.json();
    if (!finalizeData.success) {
      throw new Error('Quiz finalization failed: ' + JSON.stringify(finalizeData));
    }
    console.log('✅ Quiz finalized successfully!');
    console.log('📊 Result ID:', finalizeData.resultId);
    console.log('📈 Summary:', finalizeData.summary);
    
    console.log('\n🎉 FRONTEND INTEGRATION TEST PASSED!');
    console.log('📧 Email should be sent to:', testEmail);
    console.log('💾 Data stored in: demo_test_answer → school students collection');
    console.log('🌐 Frontend can now access: http://localhost:5173');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testFrontendIntegration();
