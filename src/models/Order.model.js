const { Schema, model } = require("mongoose");
const OrderSchema = new Schema(
  {
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    userId: {
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
      enum: ["CREATED", "CONFIRMED", "CANCELLED"],
      default: "CREATED",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },
    shippingStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"],
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
      new Schema(
        {
          status: {
            type: String,
            enum: ["CREATED", "CONFIRMED", "CANCELLED"],
          },
          at: Date,
          by: String,
        },
        { _id: false },
      ),
    ],
    shippingStatusHistory: [
      new Schema(
        {
          status: {
            type: String,
            enum: ["PENDING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"],
          },
          at: Date,
          by: String,
        },
        { _id: false },
      ),
    ],
    shippingAddress: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: "India",
      },
      pincode: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true },
);

const OrderModel = model("Order", OrderSchema);
module.exports = OrderModel;
