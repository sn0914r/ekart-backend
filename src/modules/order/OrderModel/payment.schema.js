import { Schema } from "mongoose";

export const PaymentSchema = new Schema(
  {
    poePaymentId: { type: String, default: null },
    gateway: { type: String, default: null },
    paymentMethod: { type: String, default: null },

    failureCode: { type: String, default: null },
    failureReason: { type: String, default: null },
    failureDescription: { type: String, default: null },
  },
  {
    _id: false,
  },
);
