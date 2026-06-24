import { Schema } from "mongoose";

export const PaymentSchema = new Schema(
  {
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    failureCode: { type: String, default: null },
    failureReason: { type: String, default: null },
    failureDescription: { type: String, default: null },
  },
  {
    _id: false,
  },
);
