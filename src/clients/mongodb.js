const mongoose = require("mongoose");
const config = require("../configs/index.js");
const { logger } = require("../utils/logger.js");

async function connectDB() {
  try {
    await mongoose.connect(config.mongoURI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
