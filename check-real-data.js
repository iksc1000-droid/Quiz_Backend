import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";

const MONGO_URI_SOURCE = process.env.MONGO_URI_SOURCE;
const MONGO_URI_RESULTS = process.env.MONGO_URI_RESULTS;

console.log('🔍 CHECKING REAL DATA LOCATIONS...\n');

const checkRealData = async () => {
  try {
    console.log('📊 CURRENT CONFIGURATION:');
    console.log('Source URI:', MONGO_URI_SOURCE);
    console.log('Results URI:', MONGO_URI_RESULTS);
    console.log('');

    // Connect to databases
    const sourceConn = await mongoose.createConnection(MONGO_URI_SOURCE, { maxPoolSize: 10 });
    const resultsConn = await mongoose.createConnection(MONGO_URI_RESULTS, { maxPoolSize: 10 });

    console.log('✅ Connected to both databases\n');

    // Check what's actually in the source database
    console.log('📋 CHECKING SOURCE DATABASE:');
    const sourceDb = sourceConn.db;
    const sourceCollections = await sourceDb.listCollections().toArray();
    console.log('Collections in source DB:', sourceCollections.map(c => c.name));
    
    // Check if school students collection exists
    if (sourceCollections.some(c => c.name === 'school students')) {
      const QuizSchema = new mongoose.Schema({}, { collection: "school students", strict: false });
      const Quiz = sourceConn.model("Quiz", QuizSchema);
      const quizCount = await Quiz.countDocuments();
      console.log(`✅ "school students" collection found with ${quizCount} documents`);
      
      if (quizCount > 0) {
        const quiz = await Quiz.findOne();
        console.log('Sample quiz data:', {
          quizId: quiz.quizId,
          title: quiz.title,
          questionsCount: quiz.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0
        });
      }
    } else {
      console.log('❌ "school students" collection NOT found in source DB');
    }
    console.log('');

    // Check what's actually in the results database
    console.log('💾 CHECKING RESULTS DATABASE:');
    const resultsDb = resultsConn.db;
    const resultsCollections = await resultsDb.listCollections().toArray();
    console.log('Collections in results DB:', resultsCollections.map(c => c.name));
    
    // Check attempts
    if (resultsCollections.some(c => c.name === 'attempts')) {
      const AttemptSchema = new mongoose.Schema({}, { collection: "attempts", strict: false });
      const Attempt = resultsConn.model("Attempt", AttemptSchema);
      const attemptCount = await Attempt.countDocuments();
      console.log(`✅ "attempts" collection found with ${attemptCount} documents`);
    } else {
      console.log('❌ "attempts" collection NOT found in results DB');
    }
    console.log('');

    // Check if demo_test database exists
    console.log('🧪 CHECKING FOR DEMO_TEST DATABASE:');
    try {
      const demoConn = await mongoose.createConnection(MONGO_URI_SOURCE.replace('/Bandhan?', '/demo_test?'), { maxPoolSize: 10 });
      const demoDb = demoConn.db;
      const demoCollections = await demoDb.listCollections().toArray();
      console.log('Collections in demo_test DB:', demoCollections.map(c => c.name));
      
      if (demoCollections.some(c => c.name === 'school students')) {
        const DemoQuizSchema = new mongoose.Schema({}, { collection: "school students", strict: false });
        const DemoQuiz = demoConn.model("DemoQuiz", DemoQuizSchema);
        const demoQuizCount = await DemoQuiz.countDocuments();
        console.log(`✅ "school students" collection found in demo_test with ${demoQuizCount} documents`);
        
        if (demoQuizCount > 0) {
          const demoQuiz = await DemoQuiz.findOne();
          console.log('Sample demo quiz data:', {
            quizId: demoQuiz.quizId,
            title: demoQuiz.title,
            questionsCount: demoQuiz.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0
          });
        }
      } else {
        console.log('❌ "school students" collection NOT found in demo_test DB');
      }
      
      await demoConn.close();
    } catch (error) {
      console.log('❌ Could not connect to demo_test database:', error.message);
    }
    console.log('');

    // Test email configuration
    console.log('📧 CHECKING EMAIL CONFIGURATION:');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP User:', process.env.SMTP_USER);
    console.log('SMTP Pass:', process.env.SMTP_PASS ? 'Present' : 'Missing');
    console.log('From Email:', process.env.FROM_EMAIL);
    console.log('From Name:', process.env.FROM_NAME);

    await sourceConn.close();
    await resultsConn.close();
    console.log('\n✅ Database connections closed');

  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  }
};

checkRealData();
