const validateTransition = require("./transition.validator");

const SHIPPING_TRANSITIONS = {
  PENDING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const validateShippingStatusTransition = (from, to) => {
  validateTransition(SHIPPING_TRANSITIONS, from, to);
};

module.exports = { validateShippingStatusTransition };
