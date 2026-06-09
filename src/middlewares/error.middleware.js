import { configs } from "../configs/index.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { AppError } from "../errors/AppError.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (err, _req, res, _next) => {
  const isProd = configs.node_env === "production";

  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errorCode: ERROR_CODES.VALIDATION_ERROR,
      errors: err.details.map((detail) => detail.message),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Mongoose Error: Invalid Object Id: ${err.path}: ${err.value}`,
      errorCode: ERROR_CODES.INVALID_ID,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      errorCode: ERROR_CODES.INVALID_TOKEN,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      errorCode: ERROR_CODES.TOKEN_EXPIRED,
    });
  }

  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
    stack: isProd ? undefined : err.stack,
  });
};
