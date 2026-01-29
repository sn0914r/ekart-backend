const { Schema, model } = require("mongoose");
const PaymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpaySignature: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);
const PaymentModel = model("payments", PaymentSchema);
module.exports = PaymentModel;
