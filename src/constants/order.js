export const ORDER_STATUS = {
  CREATED: "CREATED",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

export const SHIPPING_STATUS = {
  PENDING: "PENDING",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
};

export const VALID_ORDER_SORT_FIELDS_FOR_ADMIN_LIST = [
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

export const ORDER_TIMELINE_LABELS = {
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

export const ORDER_TRANSITIONS = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
};

export const SHIPPING_TRANSITIONS = {
  PENDING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
