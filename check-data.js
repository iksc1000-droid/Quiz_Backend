import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";

const MONGO_URI_SOURCE = process.env.MONGO_URI_SOURCE;
const MONGO_URI_RESULTS = process.env.MONGO_URI_RESULTS;

console.log('🔍 Checking Data Storage Locations...\n');

const checkData = async () => {
  try {
    console.log('📊 DATABASE CONNECTIONS:');
    console.log('Source DB (Quiz Data):', MONGO_URI_SOURCE.split('@')[1].split('/')[0]);
    console.log('Results DB (User Data):', MONGO_URI_RESULTS.split('@')[1].split('/')[0]);
    console.log('');

    // Connect to databases
    const sourceConn = await mongoose.createConnection(MONGO_URI_SOURCE, { maxPoolSize: 10 });
    const resultsConn = await mongoose.createConnection(MONGO_URI_RESULTS, { maxPoolSize: 10 });

    console.log('✅ Connected to both databases\n');

    // Check Source Database (Quiz Data)
    console.log('📋 SOURCE DATABASE - Quiz Data:');
    console.log('Collection: "school students"');
    
    const QuizSchema = new mongoose.Schema({}, { collection: "school students", strict: false });
    const Quiz = sourceConn.model("Quiz", QuizSchema);
    
    const quizCount = await Quiz.countDocuments();
    console.log(`Total Quiz Documents: ${quizCount}`);
    
    if (quizCount > 0) {
      const quiz = await Quiz.findOne();
      console.log('Sample Quiz Data:');
      console.log(`- Quiz ID: ${quiz.quizId}`);
      console.log(`- Title: ${quiz.title}`);
      console.log(`- Sections: ${quiz.sections?.length || 0}`);
      console.log(`- Total Questions: ${quiz.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0}`);
      console.log(`- Scoring Method: ${quiz.scoringFramework?.method || 'N/A'}`);
    }
    console.log('');

    // Check Results Database - Attempts
    console.log('💾 RESULTS DATABASE - User Attempts:');
    console.log('Collection: "attempts"');
    
    const AttemptSchema = new mongoose.Schema({}, { collection: "attempts", strict: false });
    const Attempt = resultsConn.model("Attempt", AttemptSchema);
    
    const attemptCount = await Attempt.countDocuments();
    console.log(`Total Attempts: ${attemptCount}`);
    
    if (attemptCount > 0) {
      const attempts = await Attempt.find().limit(3).sort({ createdAt: -1 });
      console.log('Recent Attempts:');
      attempts.forEach((attempt, index) => {
        console.log(`${index + 1}. User: ${attempt.userId || 'N/A'}`);
        console.log(`   Quiz: ${attempt.quizId || 'N/A'}`);
        console.log(`   Status: ${attempt.status || 'N/A'}`);
        console.log(`   Answers: ${attempt.answers?.length || 0}`);
        console.log(`   Created: ${attempt.createdAt || 'N/A'}`);
        console.log('');
      });
    }
    console.log('');

    // Check Results Database - Results
    console.log('📊 RESULTS DATABASE - Quiz Results:');
    console.log('Collection: "results"');
    
    const ResultSchema = new mongoose.Schema({}, { collection: "results", strict: false });
    const Result = resultsConn.model("Result", ResultSchema);
    
    const resultCount = await Result.countDocuments();
    console.log(`Total Results: ${resultCount}`);
    
    if (resultCount > 0) {
      const results = await Result.find().limit(3).sort({ createdAt: -1 });
      console.log('Recent Results:');
      results.forEach((result, index) => {
        console.log(`${index + 1}. User: ${result.name || 'N/A'} (${result.email || 'N/A'})`);
        console.log(`   Quiz: ${result.quizId || 'N/A'}`);
        console.log(`   Top Category: ${result.summary?.topCategory || 'N/A'}`);
        console.log(`   Created: ${result.createdAt || 'N/A'}`);
        console.log('');
      });
    }
    console.log('');

    // Check Results Database - Attendance
    console.log('📝 RESULTS DATABASE - Attendance:');
    console.log('Collection: "attendance"');
    
    const AttendanceSchema = new mongoose.Schema({}, { collection: "attendance", strict: false });
    const Attendance = resultsConn.model("Attendance", AttendanceSchema);
    
    const attendanceCount = await Attendance.countDocuments();
    console.log(`Total Attendance Records: ${attendanceCount}`);
    
    if (attendanceCount > 0) {
      const attendance = await Attendance.find().limit(3).sort({ attendedAt: -1 });
      console.log('Recent Attendance:');
      attendance.forEach((record, index) => {
        console.log(`${index + 1}. Email: ${record.email || 'N/A'}`);
        console.log(`   Quiz: ${record.quizId || 'N/A'}`);
        console.log(`   Attended: ${record.attendedAt || 'N/A'}`);
        console.log('');
      });
    }

    console.log('🌐 HOW TO ACCESS YOUR DATA:');
    console.log('1. Go to: https://cloud.mongodb.com/');
    console.log('2. Login with your MongoDB Atlas account');
    console.log('3. Navigate to your cluster: PsychometricCluster');
    console.log('4. Click "Browse Collections"');
    console.log('5. You will see:');
    console.log('   - Bandhan database → "school students" collection (Quiz data)');
    console.log('   - Bandhan_wpd_report database → "attempts", "results", "attendance" collections (User data)');
    console.log('');
    console.log('📧 DATABASE CREDENTIALS:');
    console.log('Username: psychouser');
    console.log('Password: Psycho@1234');
    console.log('Cluster: psychometriccluster.jryoayj.mongodb.net');

    await sourceConn.close();
    await resultsConn.close();
    console.log('\n✅ Database connections closed');

  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  }
};

checkData();
