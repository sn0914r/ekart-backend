const crypto = require("crypto");

const razorpay = require("../configs/razorpay.config");

const { getPriceSnapShot } = require("./pricing.service");
const AppError = require("../errors/AppError");

const { sendOrderConfirmation } = require("./email.service");
const { checkStock } = require("./product.service");
const { admin, db } = require("../configs/firebase.config");
const PaymentModel = require("../models/Payment.model");
const OrderSnapshotModel = require("../models/OrderSnapshot");
const mongoose = require("mongoose");
const ProductModel = require("../models/Product.model");
const OrderModel = require("../models/Order.model");

/**
 * Creates a Razorpay order that the client uses to open checkout
 *
 * Flow:
 *  - Checks stock
 *  - Gets the price snapshot
 *  - Creates the razorpay order
 *  - Saves the snapshot in db (expires in 15 minutes)
 *
 * @returns {object} - Razorpay Order
 */
const createPaymentOrder = async ({ userId, orderId }) => {
  const order = await OrderModel.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);

  const RAZORPAY_OPTIONS = {
    amount: order.subTotal * 100,
    currency: order.currency || "INR",
    receipt: `receipt_${userId.slice(0, 4)}_${Date.now()}`, // NOTE: the razorpay receipt must be lessthan 40 chars
  };

  const razorpayOrder = await razorpay.orders.create(RAZORPAY_OPTIONS);
  order.paymentDetails.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  };
};

/**
 * Service Entry point for VerifyPaymentController
 *
 * Flow:
 *  - Check payment already processed or not
 *  - Verifies the signatures
 *  - Calculates total Amount
 *  - Checks stock
 *  - Reduces stock
 *  - Creates Order
 *  - Creates Payment Record
 *  - Notifies the customer
 *
 * @returns {Object} - {Order Id, Payment Id}
 */
const handlePaymentsAndOrder = async ({
  razorpaySignature,
  razorpayOrderId,
  razorpayPaymentId,
  userId,
}) => {
  let order;
  // Idempotency check
  order = await OrderModel.findOne({
    "paymentDetails.razorpayPaymentId": razorpayPaymentId,
  });
  if (order) throw new AppError(`Payment already processed: ${order._id}`, 400);

  order = await OrderModel.findOne({
    "paymentDetails.razorpayOrderId": razorpayOrderId,
  });


  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  if (generatedSignature !== razorpaySignature)
    throw new AppError("Invalid payment", 400);

  order.paymentStatus = "PAID";
  order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
  order.paymentDetails.razorpaySignature = razorpaySignature;
  await order.save();

  const orderSnapshot = order.orderSnapshot;
  if (!orderSnapshot) throw new AppError("Order not found", 404);

  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    for (const item of orderSnapshot) {
      // read the product
      const targetProduct = await ProductModel.findOne({ _id: item.productId });

      if (!targetProduct) {
        throw new AppError(`Product (${item.name}) not found`, 404);
      }
      if (!targetProduct.isActive)
        throw new AppError("Product is not available", 400);
      if (targetProduct.stock < item.quantity) {
        throw new AppError(`Product (${targetProduct.name}) out of stock`, 400);
      }

      // reduce stock
      targetProduct.stock -= item.quantity;
      await targetProduct.save();
    }

    // save the order
    ((order.orderStatus = "CONFIRMED"),
      order.orderStatusHistory.push({
        status: "CONFIRMED",
        at: new Date(),
        by: userId,
      }));
    await order.save();
  });
  await session.endSession();

  await sendOrderConfirmation({
    email: order.email,
    totalAmount: order.subTotal,
    timestamp: new Date().toString(),
    orderId: order._id,
  });

  return { orderId: order._id, paymentId: razorpayPaymentId };
};

module.exports = { createPaymentOrder, handlePaymentsAndOrder };
