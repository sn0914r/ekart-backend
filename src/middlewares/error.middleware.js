const config = require("../configs");
const { ERROR_CODES } = require("../constants/errorCodes");
const { logger } = require("../utils/logger");

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProd = config.node_env === "production";

  const message =
    statusCode === 500 && isProd ? "Something went wrong" : err.message;

  const errorResponse = {
    success: false,
    message,
    errorCode: err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR,
  };

  if (err.errorCode === ERROR_CODES.VALIDATION_ERROR) {
    errorResponse.errors = err.errors;
  }

  if (!isProd) {
    logger.error(err.message, err);
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      errorCode: ERROR_CODES.BAD_REQUEST_ERROR,
    });
  }

  return res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
