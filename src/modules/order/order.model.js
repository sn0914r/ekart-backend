import { Schema, model } from "mongoose";
import { ORDER } from "./order.constants.js";

const { ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS } = ORDER;

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId },
    quantity: Number,
    unitPrice: Number,
    name: String,
    imageUrl: String,
    lineTotal: Number,
  },
  { _id: false },
);

const PaymentSchema = new Schema(
  {
    poePaymentId: { type: String, default: null },
    gateway: { type: String, default: null },
    paymentMethod: { type: String, default: null },

    failureCode: { type: String, default: null },
    failureReason: { type: String, default: null },
    failureDescription: { type: String, default: null },
  },
  { _id: false },
);

const StatusHistorySchema = new Schema(
  {
    status: String,
    at: Date,
    by: String,
  },
  { _id: false },
);

const ShippingAddressSchema = new Schema(
  {
    name: String,
    address: String,
    phone: String,
    city: String,
    state: String,
    country: { type: String, default: "India" },
    pincode: String,
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    currency: { type: String, default: "INR" },
    userId: String,
    email: String,

    orderId: {
      type: String,
      unique: true,
      index: true,
    },

    orderSnapshot: [OrderItemSchema],

    subTotal: { type: Number, min: 0 },

    isStockReverted: { type: Boolean, default: false },

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

    orderStatusHistory: [StatusHistorySchema],
    shippingStatusHistory: [StatusHistorySchema],
    paymentStatusHistory: [StatusHistorySchema],
    shippingAddress: ShippingAddressSchema,

    idempotencyKey: String,
  },
  { timestamps: true, versionKey: false },
);

OrderSchema.pre("save", function () {
  if (!this.orderId) {
    this.orderId = `EK-${this._id.toString().slice(-6).toUpperCase()}`;
  }
});

const OrderModel = model("Order", OrderSchema);
export default OrderModel;
