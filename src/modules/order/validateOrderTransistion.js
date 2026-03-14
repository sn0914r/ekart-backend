const AppError = require("../../errors/AppError");

const ORDER_TRANSITIONS = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: [],
  CANCELLED: [],
};

const validateOrderStatusTransition = (from, to) => {
  if (from === to) return;

  const allowed = ORDER_TRANSITIONS[from];

  if (!allowed || !allowed.includes(to)) {
    throw new AppError(
      `Order status cannot be changed from ${from} to ${to}`,
      400,
    );
  }
};

module.exports = validateOrderStatusTransition;
