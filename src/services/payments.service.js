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
const createPaymentOrder = async (items, uid, email) => {
  // await checkStock(items);

  const { totalAmount, items: itemsSnapshot } = await getPriceSnapShot(items);

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: `receipt_${uid.slice(0, 5)}_${Date.now()}`,
  };

  // NOTE: the razorpay receipt must be lessthan 40 chars
  const order = await razorpay.orders.create(options);

  await OrderSnapshotModel.create({
    userId: uid,
    email,
    razorpayOrderId: order.id,

    items: itemsSnapshot,
    subtotal: totalAmount,
    createdAt: new Date(),
  });
  return order;
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
  email,

  items,
}) => {
  let order;
  order = await OrderModel.findOne({
    "paymentDetails.razorpayPaymentId": razorpayPaymentId,
  });

  if (order) {
    throw new AppError(`Payment already processed: ${order._id}`, 400);
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  if (generatedSignature !== razorpaySignature) {
    throw new AppError("Invalid payment", 400);
  }

  const orderSnapshot = await OrderSnapshotModel.findOne({
    razorpayOrderId,
  });

  if (!orderSnapshot) {
    throw new AppError("Order not found", 404);
  }

  const itemsSnapshot = orderSnapshot.items;
  const subtotal = orderSnapshot.subtotal;
  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    for (const item of itemsSnapshot) {
      // read the product
      const targetProduct = await ProductModel.findOne({ _id: item.productId });

      if (!targetProduct) {
        throw new AppError(`Product (${item.productId}) not found`, 404);
      }
      if (targetProduct.stock < item.quantity) {
        throw new AppError(`Product (${targetProduct.name}) out of stock`, 400);
      }

      // reduce stock
      targetProduct.stock -= item.quantity;
      await targetProduct.save();
    }

    // save the order
    order = await OrderModel.create({
      userId,
      email,
      orderSnapshot: itemsSnapshot,
      subtotal,
      orderStatus: "CREATED",
      paymentStatus: "PAID",
      paymentDetails: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      },
    });
  });

  // delete order snapshot
  await OrderSnapshotModel.deleteOne({ razorpayOrderId });

  await session.endSession();

  if (!order) {
    throw new AppError("Failed to create the order", 500);
  }

  await sendOrderConfirmation({
    email,
    totalAmount: subtotal,
    timestamp: new Date().toString(),
    orderId: order._id,
    paymentId: razorpayPaymentId,
  });
  return { orderId: order._id, paymentId: razorpayPaymentId };
};

module.exports = { createPaymentOrder, handlePaymentsAndOrder };
