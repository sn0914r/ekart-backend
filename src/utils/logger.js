const config = require("../configs/index.js");
const isProduction = config.node_env === "production";

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

const logger = {
  info: (message) => {
    if (!isProduction) {
      console.log(formatMessage("info", message));
    }
  },

  warn: (message) => {
    console.warn(formatMessage("warn", message));
  },

  error: (message, error) => {
    console.error(formatMessage("error", message));
    if (!isProduction && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  },
};

module.exports = { logger };
