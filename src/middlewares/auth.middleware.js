const { auth } = require("../configs/firebase.config");
const AppError = require("../errors/AppError");

/**
 * @desc Verify user authentication
 *
 * Preconditions:
 *  - req.headers.authorization is a valid Bearer token
 *
 * Effects:
 *  - Attaches authenticated user to req.user
 *
 * Blocks when:
 *  - Token is missing or Invalid
 */

const verifyAuth = async (req, res, next) => {
  if (!req.headers?.authorization?.startsWith("Bearer ")) {
    throw new AppError("Bearer token is missing", 401);
  }

  const idToken = req.headers.authorization.split(" ")[1];
  const decodedToken = await auth.verifyIdToken(idToken);
  req.user = decodedToken;
  next();
};

/**
 * @desc Allow access to admin routes
 *
 * Preconditions:
 *  - Request is authenticated
 *
 * Blocks when:
 *  - req.user.role is not "admin"
 */
const requireAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new AppError("admin access only", 403);
  }
  next();
};

/**
 * @desc Allow access to user routes
 *
 * Preconditions:
 *  - Request is authenticated
 *
 * Blocks when:
 *  - req.user.role is "admin"
 */
const requireUser = async (req, res, next) => {
  if (req.user.role === "admin") {
    throw new AppError("user access only", 403);
  }
  next();
};

module.exports = { verifyAuth, requireAdmin, requireUser };
