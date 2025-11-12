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
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "UserAttempt" },
    resultToken: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      required: true,
      unique: false // Don't set unique here, use index with partial filter instead
    }
  }, { timestamps: true, collection: collectionName });

  // Pre-save hook: Ensure resultToken is always set (defense in depth)
  ResultSchema.pre('save', function(next) {
    // If resultToken is missing or null, generate a new one
    if (!this.resultToken || this.resultToken === null || this.resultToken === '') {
      this.resultToken = new mongoose.Types.ObjectId().toString();
    }
    next();
  });

  // Pre-validate hook: Double-check before validation
  ResultSchema.pre('validate', function(next) {
    if (!this.resultToken || this.resultToken === null || this.resultToken === '') {
      this.resultToken = new mongoose.Types.ObjectId().toString();
    }
    next();
  });

  // Create unique index with partial filter (allows multiple nulls, but unique non-nulls)
  ResultSchema.index(
    { resultToken: 1 },
    { 
      unique: true, 
      partialFilterExpression: { resultToken: { $exists: true, $ne: null } },
      name: 'resultToken_1_unique'
    }
  );

  return resultsConn.model(`UserResult_${collectionName}`, ResultSchema);
};
