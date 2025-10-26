import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const testIndianPhoneValidation = async () => {
  console.log('🧪 TESTING INDIAN PHONE NUMBER VALIDATION...\n');
  
  const testCases = [
    { phone: '9876543210', name: 'Valid Indian Mobile (9)', shouldPass: true },
    { phone: '8765432109', name: 'Valid Indian Mobile (8)', shouldPass: true },
    { phone: '7654321098', name: 'Valid Indian Mobile (7)', shouldPass: true },
    { phone: '6543210987', name: 'Valid Indian Mobile (6)', shouldPass: true },
    { phone: '1234567890', name: 'Invalid (starts with 1)', shouldPass: false },
    { phone: '2345678901', name: 'Invalid (starts with 2)', shouldPass: false },
    { phone: '3456789012', name: 'Invalid (starts with 3)', shouldPass: false },
    { phone: '4567890123', name: 'Invalid (starts with 4)', shouldPass: false },
    { phone: '5678901234', name: 'Invalid (starts with 5)', shouldPass: false },
    { phone: '987654321', name: 'Invalid (9 digits)', shouldPass: false },
    { phone: '98765432101', name: 'Invalid (11 digits)', shouldPass: false },
    { phone: '987654321a', name: 'Invalid (contains letter)', shouldPass: false }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name} (${testCase.phone})`);
      
      const response = await fetch(`${BASE_URL}/api/quizzes/career_school_v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: `test${Date.now()}@example.com`,
          phone: testCase.phone
        })
      });
      
      const data = await response.json();
      
      if (testCase.shouldPass) {
        if (data.success) {
          console.log('✅ PASS - Valid phone number accepted');
        } else {
          console.log('❌ FAIL - Valid phone number rejected:', data.message);
        }
      } else {
        if (!data.success) {
          console.log('✅ PASS - Invalid phone number rejected:', data.message);
        } else {
          console.log('❌ FAIL - Invalid phone number accepted');
        }
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
    
    console.log('---');
  }
  
  console.log('\n🎉 INDIAN PHONE VALIDATION TEST COMPLETED!');
};

testIndianPhoneValidation();
