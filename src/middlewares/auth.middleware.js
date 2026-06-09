import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { logger } from "../utils/logger.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { configs } from "../configs/index.js";

export const authenticate = async (req, res, next) => {
  if (!req.headers?.authorization?.startsWith("Bearer ")) {
    throw new AppError(
      "Bearer token is missing",
      401,
      ERROR_CODES.UNAUTHORIZED_ERROR,
    );
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, configs.auth_jwt.accessSecret);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error(`JWT Verification failed: ${error.message}`);

    throw new AppError(
      error.message === "jwt expired"
        ? "Session expired"
        : "Invalid authentication token",
      401,
      ERROR_CODES.UNAUTHORIZED_ERROR,
    );
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        "You are not allowed to access this route",
        403,
        ERROR_CODES.FORBIDDEN_ERROR,
      );
    }
    next();
  };
};
