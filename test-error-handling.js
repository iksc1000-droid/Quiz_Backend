import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

const testErrorHandling = async () => {
  console.log('🛡️ Testing Enhanced Error Handling...\n');
  
  const tests = [
    {
      name: 'Test Invalid Quiz ID',
      method: 'GET',
      url: `${BASE_URL}/api/quizzes/invalid_quiz_id`,
      expectedStatus: 404
    },
    {
      name: 'Test Missing Quiz ID',
      method: 'GET', 
      url: `${BASE_URL}/api/quizzes/`,
      expectedStatus: 404
    },
    {
      name: 'Test Invalid Answer - Missing User ID',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/answer`,
      body: {
        questionId: 1,
        optionKey: 'a',
        optionValue: 'Test'
      },
      expectedStatus: 400
    },
    {
      name: 'Test Invalid Answer - Invalid Question ID',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/answer`,
      body: {
        userId: 'test-user',
        questionId: 'invalid',
        optionKey: 'a',
        optionValue: 'Test'
      },
      expectedStatus: 400
    },
    {
      name: 'Test Invalid Answer - Negative Question ID',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/answer`,
      body: {
        userId: 'test-user',
        questionId: -1,
        optionKey: 'a',
        optionValue: 'Test'
      },
      expectedStatus: 400
    },
    {
      name: 'Test Valid Answer',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/answer`,
      body: {
        userId: 'test-user-' + Date.now(),
        questionId: 1,
        optionKey: 'a',
        optionValue: 'Mobile & social media'
      },
      expectedStatus: 200
    },
    {
      name: 'Test Invalid Finalization - Missing Name',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/finalize`,
      body: {
        userId: 'test-user',
        email: 'test@example.com',
        phone: '1234567890',
        answers: [{ questionId: 1, optionKey: 'a', optionValue: 'Test' }]
      },
      expectedStatus: 400
    },
    {
      name: 'Test Invalid Finalization - Invalid Email',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/finalize`,
      body: {
        userId: 'test-user',
        name: 'Test User',
        email: 'invalid-email',
        phone: '1234567890',
        answers: [{ questionId: 1, optionKey: 'a', optionValue: 'Test' }]
      },
      expectedStatus: 400
    },
    {
      name: 'Test Invalid Finalization - Short Phone',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/finalize`,
      body: {
        userId: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        phone: '123',
        answers: [{ questionId: 1, optionKey: 'a', optionValue: 'Test' }]
      },
      expectedStatus: 400
    },
    {
      name: 'Test Invalid Finalization - Invalid Question ID',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/finalize`,
      body: {
        userId: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        answers: [{ questionId: 999, optionKey: 'a', optionValue: 'Test' }]
      },
      expectedStatus: 400
    },
    {
      name: 'Test Invalid Finalization - Empty Answers',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/finalize`,
      body: {
        userId: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        answers: []
      },
      expectedStatus: 400
    },
    {
      name: 'Test Valid Finalization',
      method: 'POST',
      url: `${BASE_URL}/api/quizzes/career_school_v1/finalize`,
      body: {
        userId: 'test-user-' + Date.now(),
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        answers: [
          { questionId: 1, optionKey: 'a', optionValue: 'Mobile & social media' },
          { questionId: 2, optionKey: 'b', optionValue: 'Bored and restless' },
          { questionId: 3, optionKey: 'c', optionValue: 'Social studies' }
        ]
      },
      expectedStatus: 200
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`🧪 ${test.name}...`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(test.url, options);
      const data = await response.json();
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ PASSED (${response.status})`);
        if (data.message) {
          console.log(`   Message: ${data.message}`);
        }
        passed++;
      } else {
        console.log(`❌ FAILED - Expected ${test.expectedStatus}, got ${response.status}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED - Error: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL ERROR HANDLING TESTS PASSED!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the error handling implementation.');
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (response.ok) {
      console.log('✅ Server is running\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first.');
    console.log('Run: node src/server.js');
    return false;
  }
};

const runTests = async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testErrorHandling();
  }
  process.exit(0);
};

runTests();
