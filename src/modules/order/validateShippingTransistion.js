const AppError = require("../../errors/AppError");

const SHIPPING_TRANSITIONS = {
  PENDING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const validateShippingStatusTransition = (from, to) => {
  if (from === to) return;

  const allowed = SHIPPING_TRANSITIONS[from];

  if (!allowed || !allowed.includes(to)) {
    throw new AppError(
      `Shipping status cannot be changed from ${from} to ${to}`,
      400,
    );
  }
};

module.exports = validateShippingStatusTransition;
