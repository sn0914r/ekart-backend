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
  FAILED: "FAILED",
  REFUND_PENDING: "REFUND PENDING",
  REFUNDED: "REFUNDED",
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
    FAILED: "Payment failed",
    REFUND_PENDING: "Refund initiated",
    REFUNDED: "Payment refunded",
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

export const ORDER_STATUS_EMAILS = {
  PACKED: {
    subject: "Your Order Has Been Packed",
    message: "Good news! Your order has been packed and is ready for shipment.",
  },

  SHIPPED: {
    subject: "Your Order Has Been Shipped",
    message:
      "Your order has been shipped and is on its way to your delivery address.",
  },

  DELIVERED: {
    subject: "Order Delivered",
    message:
      "Your order has been successfully delivered. We hope you enjoy your purchase.",
  },

  CANCELLED: {
    subject: "Order Cancelled",
    message: "Your order has been cancelled.",
  },
};
