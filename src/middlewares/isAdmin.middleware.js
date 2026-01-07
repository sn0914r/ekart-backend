const AppError = require("../errors/AppError");

const isAdmin = (req, res, next) => {
  const { role } = req["user"];

  if (role !== "admin") {
    return next(new AppError("You are unauthorized", 403));
  }

  next();
};

module.exports = isAdmin;
