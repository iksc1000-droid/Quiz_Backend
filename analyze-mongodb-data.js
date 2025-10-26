#!/usr/bin/env node
/**
 * Check MongoDB Collection Data
 * Analyzes what data is in the MongoDB collection and where it came from
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

console.log('🔍 Analyzing MongoDB Collection Data...\n');

async function analyzeCollectionData() {
  try {
    console.log('📊 Connecting to MongoDB...');
    console.log(`   Database: ${process.env.MONGO_URI_RESULTS?.split('/').pop().split('?')[0]}`);
    console.log(`   Collection: ${process.env.QUIZ_COLLECTION || 'school students'}`);
    
    // Connect to MongoDB
    const resultsConn = await mongoose.createConnection(process.env.MONGO_URI_RESULTS);
    console.log('✅ Connected to MongoDB');
    
    // Get the collection
    const collection = resultsConn.db.collection(process.env.QUIZ_COLLECTION || 'school students');
    
    // Count total documents
    const totalCount = await collection.countDocuments();
    console.log(`\n📊 Total Documents: ${totalCount}`);
    
    // Get sample documents to analyze
    const sampleDocs = await collection.find({}).limit(10).toArray();
    
    console.log('\n🔍 Sample Documents Analysis:');
    console.log('=' .repeat(50));
    
    sampleDocs.forEach((doc, index) => {
      console.log(`\n📄 Document ${index + 1}:`);
      console.log(`   _id: ${doc._id}`);
      console.log(`   email: ${doc.email || 'Not set'}`);
      console.log(`   name: ${doc.name || 'Not set'}`);
      console.log(`   phone: ${doc.phone || 'Not set'}`);
      console.log(`   quizId: ${doc.quizId || 'Not set'}`);
      console.log(`   status: ${doc.status || 'Not set'}`);
      console.log(`   answers: ${doc.answers ? doc.answers.length : 0} answers`);
      console.log(`   createdAt: ${doc.createdAt || 'Not set'}`);
      console.log(`   updatedAt: ${doc.updatedAt || 'Not set'}`);
      
      // Check if it's test data
      if (doc.email && (doc.email.includes('test') || doc.email.includes('example') || doc.email.includes('mock'))) {
        console.log('   🧪 TYPE: TEST DATA');
      } else if (doc.email && doc.email.includes('@')) {
        console.log('   👤 TYPE: REAL USER DATA');
      } else {
        console.log('   ❓ TYPE: UNKNOWN');
      }
    });
    
    // Analyze data sources
    console.log('\n📊 Data Source Analysis:');
    console.log('=' .repeat(50));
    
    const testEmails = await collection.find({
      email: { $regex: /test|example|mock/i }
    }).toArray();
    
    const realEmails = await collection.find({
      email: { $regex: /^[^@]+@[^@]+\.[^@]+$/, $not: { $regex: /test|example|mock/i } }
    }).toArray();
    
    console.log(`\n🧪 Test Data: ${testEmails.length} documents`);
    testEmails.forEach(doc => {
      console.log(`   - ${doc.email} (${doc.createdAt})`);
    });
    
    console.log(`\n👤 Real User Data: ${realEmails.length} documents`);
    realEmails.forEach(doc => {
      console.log(`   - ${doc.email} (${doc.createdAt})`);
    });
    
    // Check for recent data
    const recentData = await collection.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).toArray();
    
    console.log(`\n⏰ Recent Data (Last 24 hours): ${recentData.length} documents`);
    recentData.forEach(doc => {
      console.log(`   - ${doc.email} (${doc.createdAt})`);
    });
    
    // Analyze by creation time
    console.log('\n📅 Data Creation Timeline:');
    const allDocs = await collection.find({}, { email: 1, createdAt: 1 }).sort({ createdAt: 1 }).toArray();
    
    allDocs.forEach((doc, index) => {
      const date = new Date(doc.createdAt).toLocaleString();
      console.log(`   ${index + 1}. ${doc.email} - ${date}`);
    });
    
    console.log('\n🔍 Data Source Explanation:');
    console.log('=' .repeat(50));
    console.log('📧 Test/Example Data Sources:');
    console.log('   1. Our testing scripts (test-*.js files)');
    console.log('   2. Development/testing during setup');
    console.log('   3. Verification scripts we ran');
    console.log('   4. Mock data for testing purposes');
    
    console.log('\n👤 Real User Data Sources:');
    console.log('   1. Actual users taking the quiz');
    console.log('   2. Real email addresses');
    console.log('   3. Production quiz completions');
    
    console.log('\n🧹 Data Cleanup Options:');
    console.log('   1. Keep all data (recommended)');
    console.log('   2. Remove only test data');
    console.log('   3. Remove all data and start fresh');
    
    await resultsConn.close();
    console.log('\n✅ Analysis complete');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run the analysis
analyzeCollectionData().catch(error => {
  console.error('❌ Collection analysis failed:', error);
  process.exit(1);
});
