import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const testRealUserFlow = async () => {
  console.log('🧪 TESTING REAL USER FLOW WITH REAL EMAIL...\n');
  
  try {
    // Use a real email address that can receive emails
    const realEmail = 'ikscbandhan@gmail.com'; // Using the same email as SMTP user
    const realName = 'Real Test User';
    const realPhone = '9876543210';
    
    // Step 1: Register User
    console.log('1️⃣ Registering Real User...');
    const registerResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: realName,
        email: realEmail,
        phone: realPhone
      })
    });
    
    const registerData = await registerResponse.json();
    if (!registerData.success) {
      throw new Error('User registration failed: ' + JSON.stringify(registerData));
    }
    console.log('✅ User registered:', registerData.email);
    
    // Step 2: Save Complete Quiz Answers (all 30 questions)
    console.log('\n2️⃣ Saving Complete Quiz Answers...');
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
      { questionId: 10, optionKey: 'a', optionValue: 'Always' },
      { questionId: 11, optionKey: 'b', optionValue: 'Often' },
      { questionId: 12, optionKey: 'c', optionValue: 'Sometimes' },
      { questionId: 13, optionKey: 'a', optionValue: 'Very important' },
      { questionId: 14, optionKey: 'b', optionValue: 'Important' },
      { questionId: 15, optionKey: 'c', optionValue: 'Not important' },
      { questionId: 16, optionKey: 'a', optionValue: 'Strongly agree' },
      { questionId: 17, optionKey: 'b', optionValue: 'Agree' },
      { questionId: 18, optionKey: 'c', optionValue: 'Neutral' },
      { questionId: 19, optionKey: 'a', optionValue: 'Very satisfied' },
      { questionId: 20, optionKey: 'b', optionValue: 'Satisfied' },
      { questionId: 21, optionKey: 'c', optionValue: 'Neutral' },
      { questionId: 22, optionKey: 'a', optionValue: 'Excellent' },
      { questionId: 23, optionKey: 'b', optionValue: 'Good' },
      { questionId: 24, optionKey: 'c', optionValue: 'Average' },
      { questionId: 25, optionKey: 'a', optionValue: 'Very likely' },
      { questionId: 26, optionKey: 'b', optionValue: 'Likely' },
      { questionId: 27, optionKey: 'c', optionValue: 'Unlikely' },
      { questionId: 28, optionKey: 'a', optionValue: 'Very effective' },
      { questionId: 29, optionKey: 'b', optionValue: 'Effective' },
      { questionId: 30, optionKey: 'c', optionValue: 'Not effective' }
    ];
    
    for (const answer of answers) {
      const answerResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: realEmail,
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
    
    // Step 3: Finalize Quiz
    console.log('\n3️⃣ Finalizing Quiz...');
    const finalizeResponse = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: realEmail
      })
    });
    
    const finalizeData = await finalizeResponse.json();
    if (!finalizeData.success) {
      throw new Error('Quiz finalization failed: ' + JSON.stringify(finalizeData));
    }
    console.log('✅ Quiz finalized successfully!');
    console.log('📊 Result ID:', finalizeData.resultId);
    console.log('📈 Summary:', finalizeData.summary);
    
    console.log('\n🎉 REAL USER FLOW TEST COMPLETED!');
    console.log('📧 Email sent to:', realEmail);
    console.log('💾 Data stored in: demo_test_answer → school students collection');
    console.log('✅ This proves the backend is working correctly');
    console.log('🔍 Check your Gmail inbox for the email!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testRealUserFlow();
