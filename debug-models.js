import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";
import { logger } from './src/utils/logger.js';

const MONGO_URI_SOURCE = process.env.MONGO_URI_SOURCE;
const MONGO_URI_RESULTS = process.env.MONGO_URI_RESULTS;

console.log('🔍 Debugging model initialization...');
console.log('MONGO_URI_SOURCE:', MONGO_URI_SOURCE ? 'Present' : 'Missing');
console.log('MONGO_URI_RESULTS:', MONGO_URI_RESULTS ? 'Present' : 'Missing');

const debugModels = async () => {
  try {
    console.log('🔗 Connecting to databases...');
    
    const sourceConn = await mongoose.createConnection(MONGO_URI_SOURCE, {
      maxPoolSize: 10
    });
    console.log('✅ Source connection established');
    
    const resultsConn = await mongoose.createConnection(MONGO_URI_RESULTS, {
      maxPoolSize: 10
    });
    console.log('✅ Results connection established');
    
    console.log('📋 Testing model creation...');
    
    // Test Quiz model
    try {
      const { getQuizModel } = await import('./src/models/Quiz.js');
      const Quiz = getQuizModel(sourceConn);
      console.log('✅ Quiz model created successfully');
    } catch (error) {
      console.error('❌ Quiz model error:', error.message);
    }
    
    // Test Attempt model
    try {
      const { getAttemptModel } = await import('./src/models/Attempt.js');
      const Attempt = getAttemptModel(resultsConn);
      console.log('✅ Attempt model created successfully');
    } catch (error) {
      console.error('❌ Attempt model error:', error.message);
    }
    
    // Test Result model
    try {
      const { getResultModel } = await import('./src/models/Result.js');
      const Result = getResultModel(resultsConn);
      console.log('✅ Result model created successfully');
    } catch (error) {
      console.error('❌ Result model error:', error.message);
    }
    
    // Test Attendance model
    try {
      const { getAttendanceModel } = await import('./src/models/Attendance.js');
      const Attendance = getAttendanceModel(resultsConn);
      console.log('✅ Attendance model created successfully');
    } catch (error) {
      console.error('❌ Attendance model error:', error.message);
    }
    
    console.log('🎉 All models working!');
    
    await sourceConn.close();
    await resultsConn.close();
    console.log('🔌 Connections closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

debugModels();
