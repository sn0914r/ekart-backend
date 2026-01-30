const AppError = require("../errors/AppError");

const ORDER_TRANSISTIONS = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const validateOrderStatusTransistion = (from, to) => {
  if (from === "DELIVERED" || from === "CANCELLED") {
    throw new AppError(`Order cannot be updated after ${from}`, 400);
  }
  if (from === to) return;
  if (!ORDER_TRANSISTIONS[from]?.includes(to)) {
    throw new AppError(`Order cannot be updated from ${from} to ${to}`, 400);
  }
};

module.exports = validateOrderStatusTransistion;
