import jwt from "jsonwebtoken";
import { configs } from "#configs/index.js";
import { AppError } from "#errors/AppError.js";
import { logger } from "#utils/logger.js";
import { ROLES, ERROR_CODES } from "#constants/index.js";

export const authenticate = async (req, _res, next) => {
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
  return (req, _res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      const errorMessage =
        req.user.role === ROLES.DEMO_ADMIN
          ? "This is a demo account, so edits are disabled to protect the data."
          : "You are not allowed to perform this operation";
      throw new AppError(errorMessage, 403, ERROR_CODES.FORBIDDEN_ERROR);
    }
    next();
  };
};
