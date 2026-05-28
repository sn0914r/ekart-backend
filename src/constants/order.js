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

module.exports = {
  ORDER_STATUS,
  SHIPPING_STATUS,
  PAYMENT_STATUS,
  VALID_ORDER_SORT_FIELDS_ADMIN,
};
