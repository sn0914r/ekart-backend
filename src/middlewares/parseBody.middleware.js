const AppError = require("../errors/AppError");

const parseBody = (req, res, next) => {
  let data = req.body.data;

  if (!data) {
    return next(new AppError("Data field not found", 400));
  }
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (error) {
      return next(new AppError("Invalid JSON in the data field", 400));
    }
  }
console.log(data)
  if (typeof data !== "object") {
    return next(new AppError("Data field must be JSON", 400));
  }

  req.body = data;
  next();
};

module.exports = parseBody;