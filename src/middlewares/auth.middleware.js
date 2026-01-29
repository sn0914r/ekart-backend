const { auth } = require("../configs/firebase.config");
const AppError = require("../errors/AppError");

const verifyAuth = async (req, res, next) => {
    if (!req.headers?.authorization?.startsWith("Bearer ")) {
      throw new AppError("token missing", 401);
    }

    const idToken = req.headers.authorization.split(" ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  next();
};

const requireAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new AppError("admin access only", 403);
  }
  next();
};

const requireUser = async (req, res, next) => {
  if (req.user.role !== "user") {
    throw new AppError("user access only", 403);
  }
  next();
};

module.exports = { verifyAuth, requireAdmin, requireUser };
