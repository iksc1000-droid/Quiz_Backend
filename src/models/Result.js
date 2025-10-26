import mongoose from "mongoose";

// Helper function to get collection name from quizId
const getCollectionName = (quizId) => {
  if (!quizId) return 'default_results';
  
  // Convert quizId to collection name
  const baseName = quizId.replace('_v1', '').replace('_', '_');
  return `${baseName}_results`;
};

export const getResultModel = (resultsConn, quizId = null) => {
  const collectionName = getCollectionName(quizId);
  
  const ResultSchema = new mongoose.Schema({
    quizId: String,
    userId: String,
    email: { type: String, index: true }, // Add index for faster email lookups
    name: String,
    phone: String,
    summary: mongoose.Schema.Types.Mixed, // e.g., category scores, top category, driver hints
    raw: mongoose.Schema.Types.Mixed,     // raw calculation details
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "UserAttempt" }
  }, { timestamps: true, collection: collectionName });

  return resultsConn.model(`UserResult_${collectionName}`, ResultSchema);
};
