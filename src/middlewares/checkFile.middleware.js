const AppError = require("../errors/AppError");

const checkFile = (req, res, next) => {
  if (!req.file) {
    return next(new AppError("File not uploaded", 400));
  }
  next();
};

module.exports = checkFile;
