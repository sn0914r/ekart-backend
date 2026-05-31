const ORDER_STATUS = {
  CREATED: "CREATED",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

const SHIPPING_STATUS = {
  PENDING: "PENDING",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
};

const VALID_ORDER_SORT_FIELDS_ADMIN = [
  "orderId",
  "email",
  "subTotal",
  "paymentStatus",
  "shippingStatus",
  "orderStatus",
  "createdAt",
  "-orderId",
  "-email",
  "-subTotal",
  "-paymentStatus",
  "-shippingStatus",
  "-orderStatus",
  "-createdAt",
];

const ORDER_TIMELINE_LABELS = {
  PAYMENT: {
    PAID: "Payment received",
    PENDING: "Payment pending",
    // TODO: Add this in future
    // FAILED: "Payment failed",
    // REFUNDED: "Payment refunded",
  },

  ORDER: {
    CREATED: "Order placed",
    CONFIRMED: "Order confirmed",
    CANCELLED: "Order cancelled",
  },

  SHIPPING: {
    PENDING: "Awaiting shipment",
    PACKED: "Order packed",
    SHIPPED: "Order shipped",
    DELIVERED: "Order delivered",
    CANCELLED: "Shipment cancelled",
  },
};

module.exports = {
  ORDER_STATUS,
  SHIPPING_STATUS,
  PAYMENT_STATUS,
  VALID_ORDER_SORT_FIELDS_ADMIN,
  ORDER_TIMELINE_LABELS,
};
