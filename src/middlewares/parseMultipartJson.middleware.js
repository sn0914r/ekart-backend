const AppError = require("../errors/AppError");

/**
 * @desc Parse multipart JSON data
 *
 * Preconditions:
 *  - req.body.data is a valid JSON object
 *
 * Blocks when:
 *  - req.body.data is not a valid JSON object
 */
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
