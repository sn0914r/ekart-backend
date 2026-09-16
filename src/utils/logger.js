import { configs } from "#configs/index.js";

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
    console.log(formatMessage("info", message));
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
   * @param {string | Error} message
   * @param {Error} [error]
   */
  error: (message, error) => {
    const errObj = message instanceof Error ? message : error;
    const msgText =
      message instanceof Error
        ? message.message || message.name || "Unknown Error"
        : message;

    console.error(formatMessage("error", msgText));

    if (errObj instanceof Error && !isProd) {
      if (errObj.stack) {
        console.error(errObj.stack);
      }
      if (errObj.errors && Array.isArray(errObj.errors)) {
        errObj.errors.forEach((innerErr, idx) => {
          console.error(
            `  [Inner Error ${idx + 1}]:`,
            innerErr?.stack || innerErr?.message || innerErr,
          );
        });
      }
    }
  },
};
