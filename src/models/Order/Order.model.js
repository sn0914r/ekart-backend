import { Schema, model } from "mongoose";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} from "../../constants/order.js";
import { OrderItemSchema } from "./orderItem.schema.js";
import { PaymentSchema } from "./payment.schema.js";
import { StatusHistory } from "./statusHistory.schema.js";
import { ShippingAddressSchema } from "./address.schema.js";

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

    orderStatusHistory: [StatusHistory],
    shippingStatusHistory: [StatusHistory],
    paymentStatusHistory: [StatusHistory],
    shippingAddress: ShippingAddressSchema,
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
