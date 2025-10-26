import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const connectDbs = async () => {
  try {
    const source = await mongoose.createConnection(process.env.MONGO_URI_SOURCE, {
      maxPoolSize: 10
    }).asPromise();

    const results = await mongoose.createConnection(process.env.MONGO_URI_RESULTS, {
      maxPoolSize: 10
    }).asPromise();

    logger.info("✅ Mongo: connected to source & results DBs");
    return { source, results };
  } catch (error) {
    logger.error("❌ Mongo connection failed:", error);
    throw error;
  }
};
