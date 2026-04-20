const { Schema, model } = require("mongoose");
const OrderItemSchema = require("./orderItem.schema");
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} = require("../../constants/order");
const PaymentSchema = require("./payment.schema");
const StatusHistory = require("./statusHistory.schema");
const ShippingAddressSchema = require("./address.schema");

const OrderSchema = new Schema(
  {
    currency: { type: String, default: "INR" },
    userId: String,
    email: String,

    orderSnapshot: [OrderItemSchema],

    subTotal: { type: Number, min: 0 },

    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    shippingStatus: {
      type: String,
      enum: Object.values(SHIPPING_STATUS),
      default: SHIPPING_STATUS.PENDING,
    },

    paymentDetails: PaymentSchema,

    orderStatusHistory: [StatusHistory],
    shippingStatusHistory: [StatusHistory],
    shippingAddress: ShippingAddressSchema,
  },
  { timestamps: true, versionKey: false },
);

const OrderModel = model("Order", OrderSchema);
module.exports = OrderModel;
