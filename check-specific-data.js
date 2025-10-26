import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const checkSpecificData = async () => {
  try {
    console.log('🔍 CHECKING SPECIFIC MONGODB DATA...\n');
    
    // Connect to results database
    const resultsConn = await mongoose.createConnection(process.env.MONGO_URI_RESULTS, {
      maxPoolSize: 10
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Define the schema properly
    const AttemptSchema = new mongoose.Schema({
      quizId: { type: String, index: true },
      userId: { type: String, index: true },
      email: { type: String, index: true },
      name: String,
      phone: String,
      answers: [{
        questionId: Number,
        optionKey: String,
        optionValue: mongoose.Schema.Types.Mixed,
        ts: { type: Date, default: Date.now }
      }],
      meta: mongoose.Schema.Types.Mixed,
      status: { type: String, enum: ["in_progress", "submitted"], default: "in_progress" }
    }, { timestamps: true, collection: "school students" });
    
    const attempts = resultsConn.model('UserAttempt', AttemptSchema);
    
    // Get all attempts
    const allAttempts = await attempts.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`📊 Found ${allAttempts.length} attempts`);
    
    allAttempts.forEach((attempt, index) => {
      console.log(`\n📋 Attempt ${index + 1}:`);
      console.log('- Email:', attempt.email || 'NOT SET');
      console.log('- Name:', attempt.name || 'NOT SET');
      console.log('- Phone:', attempt.phone || 'NOT SET');
      console.log('- UserId:', attempt.userId || 'NOT SET');
      console.log('- QuizId:', attempt.quizId || 'NOT SET');
      console.log('- Answers Count:', attempt.answers?.length || 0);
      console.log('- Status:', attempt.status || 'NOT SET');
      console.log('- Created:', attempt.createdAt || 'NOT SET');
      console.log('- Updated:', attempt.updatedAt || 'NOT SET');
      
      if (attempt.answers && attempt.answers.length > 0) {
        console.log('- Sample Answer:', attempt.answers[0]);
      }
    });
    
    // Check for the specific debug email
    const debugAttempt = await attempts.findOne({ email: { $regex: /debug_/ } });
    if (debugAttempt) {
      console.log('\n🎯 Found debug attempt:');
      console.log(JSON.stringify(debugAttempt, null, 2));
    }
    
    await resultsConn.close();
    console.log('\n✅ MongoDB check completed');
    
  } catch (error) {
    console.error('❌ MongoDB check failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

checkSpecificData();


