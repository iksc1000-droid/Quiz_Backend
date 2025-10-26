#!/usr/bin/env node
/**
 * Backend-Frontend Connection Test
 * Tests if the backend and frontend are properly connected
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  sourceUri: process.env.MONGO_URI_SOURCE,
  resultsUri: process.env.MONGO_URI_RESULTS
};

console.log('🔗 Testing Backend-Frontend Connection...\n');

// Test 1: Backend Server Status
async function testBackendServer() {
  try {
    console.log('🌐 Testing Backend Server...');
    console.log(`   Port: ${config.port}`);
    console.log(`   CORS Origin: ${config.corsOrigin}`);
    
    const response = await fetch(`http://localhost:${config.port}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend server is running');
      console.log(`   Status: ${data.status}`);
      console.log(`   Timestamp: ${data.timestamp}`);
      return true;
    } else {
      console.error(`❌ Backend server returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend server is not running:', error.message);
    console.log('   💡 Start backend with: cd Backend && npm start');
    return false;
  }
}

// Test 2: Frontend Proxy Connection
async function testFrontendProxy() {
  try {
    console.log('\n🔄 Testing Frontend Proxy...');
    console.log('   Frontend should proxy /api/* to http://localhost:5000');
    
    // Test if frontend is running
    const frontendResponse = await fetch('http://localhost:5173');
    
    if (frontendResponse.ok) {
      console.log('✅ Frontend server is running on port 5173');
      
      // Test proxy connection
      const proxyResponse = await fetch('http://localhost:5173/api/test');
      
      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        console.log('✅ Frontend proxy is working');
        console.log(`   Proxy response: ${JSON.stringify(data)}`);
        return true;
      } else {
        console.error(`❌ Frontend proxy failed: ${proxyResponse.status}`);
        return false;
      }
    } else {
      console.error('❌ Frontend server is not running on port 5173');
      console.log('   💡 Start frontend with: cd quiz && npm run dev');
      return false;
    }
  } catch (error) {
    console.error('❌ Frontend proxy test failed:', error.message);
    console.log('   💡 Make sure both frontend and backend are running');
    return false;
  }
}

// Test 3: Database Connections
async function testDatabaseConnections() {
  try {
    console.log('\n📊 Testing Database Connections...');
    
    // Test Source DB
    const sourceConn = await mongoose.createConnection(config.sourceUri);
    console.log('✅ Source database connected');
    
    // Test Results DB
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    console.log('✅ Results database connected');
    
    // Test collections
    try {
      const sourceCollections = await sourceConn.db.listCollections().toArray();
      const resultsCollections = await resultsConn.db.listCollections().toArray();
      
      console.log(`   Source collections: ${sourceCollections.map(c => c.name).join(', ')}`);
      console.log(`   Results collections: ${resultsCollections.map(c => c.name).join(', ')}`);
    } catch (error) {
      console.log('   ⚠️  Could not list collections (permission issue)');
    }
    
    await sourceConn.close();
    await resultsConn.close();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Test 4: API Endpoints
async function testAPIEndpoints() {
  try {
    console.log('\n🔌 Testing API Endpoints...');
    
    const baseUrl = `http://localhost:${config.port}`;
    
    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/health`);
    if (healthResponse.ok) {
      console.log('✅ /health endpoint working');
    } else {
      console.error('❌ /health endpoint failed');
      return false;
    }
    
    // Test quiz endpoint
    const quizResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1`);
    if (quizResponse.ok) {
      console.log('✅ /api/quizzes/career_school_v1 endpoint working');
    } else {
      console.error(`❌ /api/quizzes/career_school_v1 endpoint failed: ${quizResponse.status}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ API endpoints test failed:', error.message);
    return false;
  }
}

// Test 5: Complete Flow Test
async function testCompleteFlow() {
  try {
    console.log('\n🎯 Testing Complete Flow...');
    
    const baseUrl = `http://localhost:${config.port}`;
    
    // Test user registration
    console.log('   Testing user registration...');
    const registerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        gender: 'male'
      })
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ User registration working');
      
      // Test answer saving
      console.log('   Testing answer saving...');
      const answerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          questionId: 'A1',
          optionKey: 'a',
          optionValue: 'Option A1'
        })
      });
      
      if (answerResponse.ok) {
        console.log('✅ Answer saving working');
        
        // Test finalization
        console.log('   Testing quiz finalization...');
        const finalizeResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: registerData.userId,
            email: 'test@example.com',
            name: 'Test User',
            phone: '1234567890',
            answers: [
              { questionId: 'A1', selectedOption: 'a' },
              { questionId: 'A2', selectedOption: 'b' }
            ]
          })
        });
        
        if (finalizeResponse.ok) {
          console.log('✅ Quiz finalization working');
          return true;
        } else {
          console.error(`❌ Quiz finalization failed: ${finalizeResponse.status}`);
          const errorText = await finalizeResponse.text();
          console.error('   Error details:', errorText);
          return false;
        }
      } else {
        console.error(`❌ Answer saving failed: ${answerResponse.status}`);
        return false;
      }
    } else {
      console.error(`❌ User registration failed: ${registerResponse.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Complete flow test failed:', error.message);
    return false;
  }
}

// Main test function
async function runConnectionTests() {
  console.log('🚀 Starting Backend-Frontend Connection Tests...\n');
  
  const tests = [
    { name: 'Backend Server', fn: testBackendServer },
    { name: 'Frontend Proxy', fn: testFrontendProxy },
    { name: 'Database Connections', fn: testDatabaseConnections },
    { name: 'API Endpoints', fn: testAPIEndpoints },
    { name: 'Complete Flow', fn: testCompleteFlow }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    const passed = await test.fn();
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('\n📊 Connection Test Results:');
  console.log('   Backend Server: ' + (tests[0].fn() ? '✅ PASS' : '❌ FAIL'));
  console.log('   Frontend Proxy: ' + (tests[1].fn() ? '✅ PASS' : '❌ FAIL'));
  console.log('   Database: ' + (tests[2].fn() ? '✅ PASS' : '❌ FAIL'));
  console.log('   API Endpoints: ' + (tests[3].fn() ? '✅ PASS' : '❌ FAIL'));
  console.log('   Complete Flow: ' + (tests[4].fn() ? '✅ PASS' : '❌ FAIL'));
  
  if (allPassed) {
    console.log('\n🎉 ALL CONNECTION TESTS PASSED! 🎉');
    console.log('   ✅ Backend and frontend are properly connected');
    console.log('   ✅ All API endpoints are working');
    console.log('   ✅ Database connections are active');
    console.log('   ✅ Complete quiz flow is functional');
    console.log('\n🚀 Your application is ready to use!');
  } else {
    console.log('\n⚠️  Some connection tests failed.');
    console.log('   Please check the error messages above and fix the issues.');
    console.log('\n💡 Quick fixes:');
    console.log('   1. Start backend: cd Backend && npm start');
    console.log('   2. Start frontend: cd quiz && npm run dev');
    console.log('   3. Check if ports 5000 and 5173 are available');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runConnectionTests().catch(error => {
  console.error('❌ Connection test execution failed:', error);
  process.exit(1);
});
