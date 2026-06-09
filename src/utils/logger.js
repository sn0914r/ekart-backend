import { configs } from "../configs/index.js";

const isProd = configs.node_env === "production";

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

export const logger = {
  /**
   * @param {string} message
   */
  info: (message) => {
    if (!isProd) {
      console.log(formatMessage("info", message));
    }
  },

  /**
   *
   * @param {string} message
   */
  warn: (message) => {
    console.warn(formatMessage("warn", message));
  },

  /**
   *
   * @param {string} message
   * @param {string} error
   */
  error: (message, error) => {
    console.error(formatMessage("error", message));
    if (!isProd && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  },
};
