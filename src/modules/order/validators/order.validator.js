const AppError = require("../../../errors/AppError");
const validateTransition = require("./transition.validator");
const { ERROR_CODES } = require("../../../constants/errorCodes");

const ORDER_TRANSITIONS = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
};

const validateOrderStatusTransition = (from, to) => {
  validateTransition(ORDER_TRANSITIONS, from, to);
};

const validateCart = (cart) => {
  if (!cart || cart.items.length === 0)
    throw new AppError("Cart is empty", 400, ERROR_CODES.BAD_REQUEST_ERROR);
};

const validateProductsExists = (products, productIds) => {
  const foundIds = new Set(products.map((p) => p._id.toString()));

  const missing = productIds.filter((pId) => !foundIds.has(pId.toString()));

  if (missing.length > 0) {
    throw new AppError(
      `Products not available: ${missing.join(", ")}`,
      404,
      ERROR_CODES.NOT_FOUND_ERROR,
    );
  }
};

const validateStock = (products, productQtyMap) => {
  products.forEach((item) => {
    if (item.stock < productQtyMap.get(item._id.toString())) {
      throw new AppError(
        `Item (${item.name}) out of stock, available: ${item.stock}`,
        409,
        ERROR_CODES.BAD_REQUEST_ERROR,
      );
    }
  });
};

module.exports = {
  validateOrderStatusTransition,
  validateCart,
  validateProductsExists,
  validateStock,
};
