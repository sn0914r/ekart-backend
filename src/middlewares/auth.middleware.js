const { auth } = require("../lib/firebase");
const AppError = require("../errors/AppError");
const { ROLES } = require("../constants/roles");
const { logger } = require("../utils/logger");
const { ERROR_CODES } = require("../constants/errorCodes");

/**
 * Verifies the user authentication and attaches the user to the req.user
 * 
 * @throws {401, ERROR_CODES.UNAUTHORIZED_ERROR} if the token is missing or invalid
 */
const verifyAuth = async (req, res, next) => {
  if (!req.headers?.authorization?.startsWith("Bearer ")) {
    throw new AppError(
      "Bearer token is missing",
      401,
      ERROR_CODES.UNAUTHORIZED_ERROR,
    );
  }

  const idToken = req.headers.authorization.split(" ")[1];
  const decodedToken = await auth.verifyIdToken(idToken);
  req.user = decodedToken;
  logger.info("User verified");
  next();
};

const requireAdmin = async (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    throw new AppError("Admin access only", 403, ERROR_CODES.FORBIDDEN_ERROR);
  }
  logger.info("User is Admin");
  next();
};

const requireUser = async (req, res, next) => {
  if (req.user.role === ROLES.ADMIN) {
    throw new AppError("User access only", 403, ERROR_CODES.FORBIDDEN_ERROR);
  }
  logger.info("User is Not Admin");
  next();
};

module.exports = { verifyAuth, requireAdmin, requireUser };
