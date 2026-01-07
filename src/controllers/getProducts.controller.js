const asyncErrorHandler = require("../utils/asyncErrorHandler");

const getProducts = asyncErrorHandler(async (req, res, next) => {
  // TODO: implement
  res.status(200).json({ success: true, message: "GET /admin/products" });
});

module.exports = getProducts;
