#!/usr/bin/env node
/**
 * Find My Data Script
 * Helps locate where the quiz data is actually being stored
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const config = {
  sourceUri: process.env.MONGO_URI_SOURCE,
  resultsUri: process.env.MONGO_URI_RESULTS,
  quizId: process.env.QUIZ_ID || 'career_school_v1'
};

console.log('🔍 Finding Your Quiz Data...\n');

// Function to search all databases and collections
async function searchAllDatabases() {
  try {
    console.log('📊 Searching Source Database...');
    console.log(`   URI: ${config.sourceUri?.substring(0, 60)}...`);
    
    const sourceConn = await mongoose.createConnection(config.sourceUri);
    console.log('✅ Connected to source database');
    
    // Get all collections in source database
    const sourceCollections = await sourceConn.db.listCollections().toArray();
    console.log(`   Collections found: ${sourceCollections.length}`);
    
    for (const collection of sourceCollections) {
      console.log(`   📁 Collection: ${collection.name}`);
      const count = await sourceConn.db.collection(collection.name).countDocuments();
      console.log(`      Documents: ${count}`);
      
      if (count > 0) {
        // Get a sample document
        const sample = await sourceConn.db.collection(collection.name).findOne();
        console.log(`      Sample keys: ${Object.keys(sample || {}).join(', ')}`);
        
        // Check if this looks like quiz data
        if (sample && (sample.quizId || sample.answers || sample.email)) {
          console.log(`      🎯 POTENTIAL QUIZ DATA FOUND!`);
          console.log(`      Sample: ${JSON.stringify(sample, null, 2).substring(0, 200)}...`);
        }
      }
    }
    
    await sourceConn.close();
    console.log('✅ Source database search completed\n');
    
  } catch (error) {
    console.error('❌ Source database search failed:', error.message);
  }
}

async function searchResultsDatabase() {
  try {
    console.log('📊 Searching Results Database...');
    console.log(`   URI: ${config.resultsUri?.substring(0, 60)}...`);
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    console.log('✅ Connected to results database');
    
    // Get all collections in results database
    const resultsCollections = await resultsConn.db.listCollections().toArray();
    console.log(`   Collections found: ${resultsCollections.length}`);
    
    for (const collection of resultsCollections) {
      console.log(`   📁 Collection: ${collection.name}`);
      const count = await resultsConn.db.collection(collection.name).countDocuments();
      console.log(`      Documents: ${count}`);
      
      if (count > 0) {
        // Get a sample document
        const sample = await resultsConn.db.collection(collection.name).findOne();
        console.log(`      Sample keys: ${Object.keys(sample || {}).join(', ')}`);
        
        // Check if this looks like quiz data
        if (sample && (sample.quizId || sample.answers || sample.email)) {
          console.log(`      🎯 QUIZ DATA FOUND!`);
          console.log(`      Sample: ${JSON.stringify(sample, null, 2).substring(0, 200)}...`);
          
          // Get more details about this collection
          const recentDocs = await resultsConn.db.collection(collection.name)
            .find({})
            .sort({ createdAt: -1 })
            .limit(3)
            .toArray();
          
          console.log(`      Recent documents:`);
          recentDocs.forEach((doc, index) => {
            console.log(`        ${index + 1}. Email: ${doc.email}, Status: ${doc.status}, Answers: ${doc.answers?.length || 0}`);
          });
        }
      }
    }
    
    await resultsConn.close();
    console.log('✅ Results database search completed\n');
    
  } catch (error) {
    console.error('❌ Results database search failed:', error.message);
  }
}

// Function to check specific collections that might contain quiz data
async function checkSpecificCollections() {
  try {
    console.log('🎯 Checking Specific Collections...');
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    
    // Common collection names that might contain quiz data
    const possibleCollections = [
      'school students',
      'attempts',
      'quiz_attempts',
      'user_attempts',
      'results',
      'quiz_results',
      'assessments',
      'career_school_v1',
      'bandhan_attempts'
    ];
    
    for (const collectionName of possibleCollections) {
      try {
        const collection = resultsConn.db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          console.log(`   ✅ Collection "${collectionName}": ${count} documents`);
          
          // Get recent documents
          const recentDocs = await collection
            .find({})
            .sort({ createdAt: -1 })
            .limit(2)
            .toArray();
          
          recentDocs.forEach((doc, index) => {
            console.log(`      ${index + 1}. Email: ${doc.email || 'N/A'}`);
            console.log(`         Status: ${doc.status || 'N/A'}`);
            console.log(`         Answers: ${doc.answers?.length || 0}`);
            console.log(`         Created: ${doc.createdAt || 'N/A'}`);
            console.log(`         QuizId: ${doc.quizId || 'N/A'}`);
          });
        } else {
          console.log(`   ❌ Collection "${collectionName}": Empty`);
        }
      } catch (error) {
        console.log(`   ⚠️  Collection "${collectionName}": Error - ${error.message}`);
      }
    }
    
    await resultsConn.close();
    
  } catch (error) {
    console.error('❌ Specific collections check failed:', error.message);
  }
}

// Function to create a test and track where it goes
async function createTestAndTrack() {
  try {
    console.log('🧪 Creating Test Data and Tracking Location...');
    
    const baseUrl = 'http://localhost:5000';
    
    // Register a test user
    console.log('   Registering test user...');
    const registerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Data Tracker User',
        email: 'tracker@example.com',
        phone: '1234567890',
        gender: 'male'
      })
    });
    
    if (!registerResponse.ok) {
      throw new Error(`Registration failed: ${registerResponse.status}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('   ✅ User registered');
    
    // Save a few answers
    console.log('   Saving answers...');
    const answers = [
      { questionId: 'A1', optionKey: 'a', optionValue: 'Option A1' },
      { questionId: 'A2', optionKey: 'b', optionValue: 'Option A2' }
    ];
    
    for (const answer of answers) {
      const answerResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'tracker@example.com',
          ...answer
        })
      });
      
      if (!answerResponse.ok) {
        throw new Error(`Answer ${answer.questionId} failed: ${answerResponse.status}`);
      }
    }
    
    console.log('   ✅ Answers saved');
    
    // Finalize quiz
    console.log('   Finalizing quiz...');
    const finalizeResponse = await fetch(`${baseUrl}/api/quizzes/career_school_v1/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: registerData.userId,
        email: 'tracker@example.com',
        name: 'Data Tracker User',
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
    
    console.log('   ✅ Quiz finalized');
    
    // Now search for this specific data
    console.log('   🔍 Searching for test data...');
    
    const resultsConn = await mongoose.createConnection(config.resultsUri);
    const collections = await resultsConn.db.listCollections().toArray();
    
    for (const collection of collections) {
      const found = await resultsConn.db.collection(collection.name)
        .findOne({ email: 'tracker@example.com' });
      
      if (found) {
        console.log(`   🎯 FOUND TEST DATA in collection: ${collection.name}`);
        console.log(`      Email: ${found.email}`);
        console.log(`      Status: ${found.status}`);
        console.log(`      Answers: ${found.answers?.length || 0}`);
        console.log(`      Created: ${found.createdAt}`);
        
        // Clean up test data
        await resultsConn.db.collection(collection.name)
          .deleteOne({ email: 'tracker@example.com' });
        console.log(`   ✅ Test data cleaned up`);
      }
    }
    
    await resultsConn.close();
    
  } catch (error) {
    console.error('❌ Test tracking failed:', error.message);
  }
}

// Main function
async function findMyData() {
  console.log('🚀 Starting Data Location Search...\n');
  
  await searchAllDatabases();
  await searchResultsDatabase();
  await checkSpecificCollections();
  await createTestAndTrack();
  
  console.log('\n📊 Search Complete!');
  console.log('If you found your data, note the collection name and database.');
  console.log('If not, the data might be in a different database or collection.');
}

// Run the search
findMyData().catch(error => {
  console.error('❌ Data search failed:', error);
  process.exit(1);
});
