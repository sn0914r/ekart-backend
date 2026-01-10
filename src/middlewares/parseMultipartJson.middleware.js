const AppError = require("../errors/AppError");

const parseMultipartJson = (req, res, next) => {
  let data = req.body.data;

  if (!data) {
    throw new AppError("Data field not found", 400);
  }

  if (typeof data === "string") {
    data = JSON.parse(data);
  }

  if (typeof data !== "object") {
    throw new AppError("Data field must be JSON object", 400);
  }

  req.body = data;
  next();
};

module.exports = parseMultipartJson;
