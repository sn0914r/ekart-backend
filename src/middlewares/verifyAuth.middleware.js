const { auth } = require("../configs/firebase.config");
const AppError = require("../errors/AppError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

const verifyAuth = asyncErrorHandler(async (req, res, next) => {
  if (!req.headers?.authorization?.startsWith("Bearer ")) {
    return next(new AppError("Token Not Found", 401));
  }

  const idToken = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req["user"] = decodedToken;
    console.log(decodedToken);
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
  next();
});

module.exports = verifyAuth;
