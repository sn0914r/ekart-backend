import mongoose from "mongoose";
import { configs } from "#configs/index.js";
import { logger } from "#utils/logger.js";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(configs.mongoURI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
};
