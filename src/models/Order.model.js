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
    // items: [
    //   {
    //     id: {
    //       type: Schema.Types.ObjectId,
    //       required: true,
    //     },
    //     quantity: {
    //       type: Number,
    //       required: true,
    //     },
    //     name: String,
    //   },
    // ],
    orderSnapshot: [
      new Schema(
        {
          productId: {
            type: Schema.Types.ObjectId,
            required: true,
          },
          quantity: Number,
          unitPrice: Number,
          lineTotal: Number,
        },
        { _id: false },
      ),
    ],

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
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
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
