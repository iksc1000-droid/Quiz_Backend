import mongoose from "mongoose";

export const getQuizModel = (sourceConn) => {
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
  }, { collection: process.env.QUIZ_COLLECTION || "school students" });

  return sourceConn.model("Quiz", QuizSchema);
};
