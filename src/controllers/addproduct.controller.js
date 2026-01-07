const asyncErrorHandler = require("../utils/asyncErrorHandler");

const addProduct = asyncErrorHandler(async (req, res, next) => {
  // TODO: implement
  res.status(200).json({ success: true, message: "POST /admin/products" });
});

module.exports = addProduct;