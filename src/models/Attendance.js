import mongoose from "mongoose";

export const getAttendanceModel = (resultsConn) => {
  const AttendanceSchema = new mongoose.Schema({
    quizId: String,
    email: { type: String, index: true },
    userId: String,
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: "UserResult" },
    attendedAt: { type: Date, default: Date.now }
  }, { collection: "school students" });

  return resultsConn.model("UserAttendance", AttendanceSchema);
};
