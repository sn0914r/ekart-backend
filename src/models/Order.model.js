const { Schema, model } = require("mongoose");
const OrderSchema = new Schema(
  {
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    userId: {
      type: Schema.Types.ObjectId,
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    orderSnapshot: [
      new Schema(
        {
          productId: {
            type: Schema.Types.ObjectId,
            required: true,
          },
          quantity: Number,
          unitPrice: Number,
          name: String,
          lineTotal: Number,
        },
        { _id: false },
      ),
    ],
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "CREATED",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },
    paymentDetails: {
      razorpayOrderId: {
        type: String,
        default: null,
      },
      razorpayPaymentId: {
        type: String,
        default: null,
      },
      razorpaySignature: {
        type: String,
        default: null,
      },
    },
    orderStatusHistory: [
      {
        status: {
          type: String,
          enum: ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
        },
        at: Date,
        by: String,
      },
    ],
  },
  { timestamps: true },
);

const OrderModel = model("Order", OrderSchema);
module.exports = OrderModel;
