import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardcoded MongoDB URI for import
const MONGO_URI_SOURCE = 'mongodb+srv://psychouser:Psycho%401234@psychometriccluster.jryoayj.mongodb.net/Bandhan?retryWrites=true&w=majority&appName=PsychometricCluster';

console.log('🔗 Connecting to MongoDB...');

// Connect to source database
const sourceConn = await mongoose.createConnection(MONGO_URI_SOURCE, {
  maxPoolSize: 10
});

// Define Quiz Schema
const SectionSchema = new mongoose.Schema({
  sectionId: String,
  title: String,
  questions: [{
    questionId: Number,
    question: mongoose.Schema.Types.Mixed,   // text or {en,hi,mr}
    options: [mongoose.Schema.Types.Mixed],  // strings or objects
    categoryTag: String,
    weightMapping: mongoose.Schema.Types.Mixed
  }]
}, { _id: false });

const QuizSchema = new mongoose.Schema({
  quizId: String,
  title: String,
  description: String,
  category: String,
  language: String,
  version: Number,
  sections: [SectionSchema],
  scoringFramework: mongoose.Schema.Types.Mixed,
  createdAt: Date,
  updatedAt: Date
}, { collection: "school students" });

const Quiz = sourceConn.model("Quiz", QuizSchema);

// Read and import quiz data
const importQuiz = async () => {
  try {
    console.log('🔄 Starting quiz import...');
    
    // Read the JSON file
    const quizDataPath = path.join(__dirname, '..', 'quiz', 'schoolstd.json');
    const quizData = JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));
    
    console.log('📄 Quiz data loaded from file');
    
    // Clear existing quiz data
    await Quiz.deleteMany({ quizId: 'career_school_v1' });
    console.log('🗑️ Cleared existing quiz data');
    
    // Insert new quiz data
    const result = await Quiz.insertMany(quizData);
    console.log(`✅ Successfully imported ${result.length} quiz document(s)`);
    
    // Verify the import
    const importedQuiz = await Quiz.findOne({ quizId: 'career_school_v1' });
    if (importedQuiz) {
      console.log('✅ Verification successful!');
      console.log(`📊 Quiz: ${importedQuiz.title}`);
      console.log(`📝 Sections: ${importedQuiz.sections.length}`);
      console.log(`❓ Total Questions: ${importedQuiz.sections.reduce((total, section) => total + section.questions.length, 0)}`);
      console.log(`🎯 Scoring Method: ${importedQuiz.scoringFramework.method}`);
      console.log(`📈 Categories: ${Object.keys(importedQuiz.scoringFramework.categories).join(', ')}`);
      
      // Test each section
      importedQuiz.sections.forEach((section, index) => {
        console.log(`\n📋 Section ${index + 1}: ${section.title}`);
        console.log(`   Questions: ${section.questions.length}`);
        section.questions.forEach((q, qIndex) => {
          console.log(`   Q${q.questionId}: ${q.question}`);
          console.log(`   Options: ${q.options.length} (${q.options.join(', ')})`);
          console.log(`   Category: ${q.categoryTag}`);
        });
      });
    } else {
      console.log('❌ Verification failed - quiz not found after import');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

importQuiz();
