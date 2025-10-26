import mongoose from "mongoose";

// Helper function to get collection name from quizId
const getCollectionName = (quizId) => {
  if (!quizId) return 'default_attempts';
  
  // Convert quizId to collection name
  const baseName = quizId.replace('_v1', '').replace('_', '_');
  return `${baseName}_attempts`;
};

export const getAttemptModel = (resultsConn, quizId = null) => {
  const collectionName = getCollectionName(quizId);
  
  const AttemptSchema = new mongoose.Schema({
    quizId: { type: String, index: true },
    userId: { type: String, index: true },          // client can send, or generate UUID
    email: { type: String, index: true },
    name: String,
    phone: String,
    gender: { type: String, enum: ['male', 'female'], default: null },
    userName: String,  // Generated username like IKSC Bandhan
    password: String,  // Generated password like IKSC Bandhan
    answers: [{
      questionId: String,  // Changed from Number to String to support "A1", "B2", etc.
      optionKey: String,   // if you send a/b/c/d
      optionValue: mongoose.Schema.Types.Mixed, // resolved text
      ts: { type: Date, default: Date.now }
    }],
    meta: mongoose.Schema.Types.Mixed,
    status: { 
      type: String, 
      enum: ["in_progress", "submitted", "finalizing", "completed"], // Added "finalizing" and "completed"
      default: "in_progress" 
    }
  }, { timestamps: true, collection: collectionName });

  return resultsConn.model(`UserAttempt_${collectionName}`, AttemptSchema);
};
