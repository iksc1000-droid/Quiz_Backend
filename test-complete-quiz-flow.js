// Complete test of the entire data flow
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api/quizzes/career_school_v1';

// Simulate complete quiz data (30 questions)
const completeQuizAnswers = [
  // Category A: Study Problems (5 questions)
  { questionId: "A1", selectedOption: "A1a", score: 3, discMapping: "I", wpdMapping: "Aesthetic" },
  { questionId: "A2", selectedOption: "A2b", score: 3, discMapping: "I", wpdMapping: "Aesthetic" },
  { questionId: "A3", selectedOption: "A3c", score: 0, discMapping: "S", wpdMapping: "Altruistic" },
  { questionId: "A4", selectedOption: "A4a", score: 0, discMapping: "D", wpdMapping: "Political" },
  { questionId: "A5", selectedOption: "A5b", score: 2, discMapping: "C", wpdMapping: "Theoretical" },
  
  // Category B: Family Pressure (5 questions)
  { questionId: "B1", selectedOption: "B1a", score: 1, discMapping: "D", wpdMapping: "Regulatory" },
  { questionId: "B2", selectedOption: "B2b", score: 2, discMapping: "S", wpdMapping: "Economic" },
  { questionId: "B3", selectedOption: "B3c", score: 3, discMapping: "I", wpdMapping: "Individualistic" },
  { questionId: "B4", selectedOption: "B4a", score: 0, discMapping: "C", wpdMapping: "Theoretical" },
  { questionId: "B5", selectedOption: "B5b", score: 1, discMapping: "D", wpdMapping: "Political" },
  
  // Category C: Personal Limitations (5 questions)
  { questionId: "C1", selectedOption: "C1a", score: 2, discMapping: "S", wpdMapping: "Altruistic" },
  { questionId: "C2", selectedOption: "C2b", score: 1, discMapping: "C", wpdMapping: "Regulatory" },
  { questionId: "C3", selectedOption: "C3c", score: 3, discMapping: "I", wpdMapping: "Aesthetic" },
  { questionId: "C4", selectedOption: "C4a", score: 0, discMapping: "D", wpdMapping: "Economic" },
  { questionId: "C5", selectedOption: "C5b", score: 2, discMapping: "S", wpdMapping: "Individualistic" },
  
  // Category D: Interest Clarity (5 questions)
  { questionId: "D1", selectedOption: "D1a", score: 0, discMapping: "D", wpdMapping: "Political" },
  { questionId: "D2", selectedOption: "D2b", score: 1, discMapping: "I", wpdMapping: "Aesthetic" },
  { questionId: "D3", selectedOption: "D3c", score: 2, discMapping: "S", wpdMapping: "Altruistic" },
  { questionId: "D4", selectedOption: "D4a", score: 3, discMapping: "C", wpdMapping: "Theoretical" },
  { questionId: "D5", selectedOption: "D5b", score: 1, discMapping: "D", wpdMapping: "Economic" },
  
  // Category E: Career Clarity (5 questions)
  { questionId: "E1", selectedOption: "E1a", score: 2, discMapping: "I", wpdMapping: "Individualistic" },
  { questionId: "E2", selectedOption: "E2b", score: 1, discMapping: "S", wpdMapping: "Altruistic" },
  { questionId: "E3", selectedOption: "E3c", score: 3, discMapping: "C", wpdMapping: "Regulatory" },
  { questionId: "E4", selectedOption: "E4a", score: 0, discMapping: "D", wpdMapping: "Political" },
  { questionId: "E5", selectedOption: "E5b", score: 2, discMapping: "I", wpdMapping: "Aesthetic" },
  
  // Category F: Financial Aspirations (5 questions)
  { questionId: "F1", selectedOption: "F1a", score: 1, discMapping: "D", wpdMapping: "Economic" },
  { questionId: "F2", selectedOption: "F2b", score: 2, discMapping: "S", wpdMapping: "Altruistic" },
  { questionId: "F3", selectedOption: "F3c", score: 3, discMapping: "I", wpdMapping: "Individualistic" },
  { questionId: "F4", selectedOption: "F4a", score: 0, discMapping: "C", wpdMapping: "Theoretical" },
  { questionId: "F5", selectedOption: "F5b", score: 1, discMapping: "D", wpdMapping: "Political" }
];

async function testCompleteFlow() {
  try {
    console.log('🔍 TESTING COMPLETE QUIZ DATA FLOW...\n');
    
    const testEmail = `test_complete_${Date.now()}@example.com`;
    const testName = 'Complete Test User';
    const testPhone = '9876543210';
    
    // Step 1: Register user
    console.log('1️⃣ Registering user...');
    const registerResponse = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        phone: testPhone
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('✅ User registered:', registerData.success);
    
    // Step 2: Save all 30 answers
    console.log('\n2️⃣ Saving all 30 quiz answers...');
    let savedCount = 0;
    
    for (const answer of completeQuizAnswers) {
      try {
        const questionId = parseInt(answer.questionId.replace(/[^\d]/g, ''));
        const optionKey = answer.selectedOption;
        const optionValue = answer.selectedOption;
        
        const answerResponse = await fetch(`${API_BASE_URL}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            questionId: questionId,
            optionKey: optionKey,
            optionValue: optionValue
          })
        });
        
        const answerData = await answerResponse.json();
        if (answerData.success) {
          savedCount++;
          console.log(`✅ Question ${answer.questionId} saved`);
        } else {
          console.log(`❌ Question ${answer.questionId} failed:`, answerData.message);
        }
      } catch (error) {
        console.log(`❌ Question ${answer.questionId} error:`, error.message);
      }
    }
    
    console.log(`\n📊 Saved ${savedCount}/30 answers`);
    
    // Step 3: Finalize quiz
    console.log('\n3️⃣ Finalizing quiz...');
    const finalizeResponse = await fetch(`${API_BASE_URL}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail
      })
    });
    
    const finalizeData = await finalizeResponse.json();
    console.log('✅ Quiz finalized:', finalizeData.success);
    
    if (finalizeData.success) {
      console.log('📊 Results:', finalizeData.data.summary);
    }
    
    console.log('\n🎉 COMPLETE TEST FINISHED');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteFlow();



