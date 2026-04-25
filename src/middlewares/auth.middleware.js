const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");
const { ROLES } = require("../constants/roles");
const { logger } = require("../utils/logger");
const { ERROR_CODES } = require("../constants/errorCodes");
const configs = require("../configs");

/**
 * Verifies the user authentication and attaches the user to the req.user
 *
 * @throws {401, ERROR_CODES.INVALID_TOKEN} if the token is missing or invalid
 */
const verifyAuth = async (req, res, next) => {
  if (!req.headers?.authorization?.startsWith("Bearer ")) {
    throw new AppError(
      "Bearer token is missing",
      401,
      ERROR_CODES.INVALID_TOKEN,
    );
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, configs.jwtSecret.access);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error("JWT Verification failed:", error.message);

    throw new AppError(
      error.message === "jwt expired"
        ? "Session expired"
        : "Invalid authentication token",
      401,
      ERROR_CODES.INVALID_TOKEN,
    );
  }
};

const requireAdmin = async (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    throw new AppError("Admin access only", 403, ERROR_CODES.FORBIDDEN_ERROR);
  }
  next();
};

const requireUser = async (req, res, next) => {
  if (req.user.role === ROLES.ADMIN) {
    throw new AppError("User access only", 403, ERROR_CODES.FORBIDDEN_ERROR);
  }
  next();
};

module.exports = { verifyAuth, requireAdmin, requireUser };
