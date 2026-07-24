export const ORDER = {
  ORDER_STATUS: {
    CREATED: "CREATED",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
  },

  SHIPPING_STATUS: {
    PENDING: "PENDING",
    PACKED: "PACKED",
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
  },

  PAYMENT_STATUS: {
    PENDING: "PENDING",
    PAID: "PAID",
    FAILED: "FAILED",
    REFUND_PENDING: "REFUND PENDING",
    REFUNDED: "REFUNDED",
  },

  VALID_SORT_ORDER_FIELDS: [
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
  ],

  TIMELINE_LABELS: {
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
  },

  ORDER_STATUS_EMAILS_LABELS: {
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
  },

  TRANSITIONS_ORDER: {
    ORDER_TRANSITIONS: {
      CREATED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["CANCELLED"],
      CANCELLED: [],
    },

    SHIPPING_TRANSITIONS: {
      PENDING: ["PACKED", "CANCELLED"],
      PACKED: ["SHIPPED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    }
  }
}