const asyncErrorHandler = require("../utils/asyncErrorHandler");

const verifyAuth = asyncErrorHandler(async (req, res, next) => {
  // TODO: implement
  next();
});

module.exports = verifyAuth;
