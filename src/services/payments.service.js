const crypto = require("crypto");
const razorpay = require("../configs/razorpay.config");

const AppError = require("../errors/AppError");

const nodemailerIntegration = require("../integrations/nodemailer.integration");
const orderConfirmationTemplate = require("../templates/email/orderConfirmation.template");

const mongoose = require("mongoose");
const ProductModel = require("../models/Product.model");
const OrderModel = require("../models/Order.model");

/**
 * @desc Creates a razorpay payment order
 *
 * Side Effects:
 *  - Creates a payment order via Razorpay API
 *  - Stores the razorpayOrderId in the order record
 *
 * @returns {<Promise { razorpayOrderId: string, amount: number, currency: string}>} Payment order details
 * @throws {AppError} If order not found
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
 * @desc Verifies the payment and confirms the order
 *
 * Side Effects:
 *  - Updates stock,  order status history, order and payment statuses
 *  - Sends order confirmation email
 *
 * Fails when:
 *  - payment is already processed
 *  - payment signatures doesn't match
 *  - product not found
 *  - product is inactive
 *
 * @returns {<Promsie {orderId: string, razorpayPaymentId: string}>} (orderId, paymentId)
 */
const handlePaymentSuccess = async ({
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

  // Sends email
  nodemailerIntegration.sendMail({
    to: order.email,
    subject: "Order has been placed successfully",
    template: orderConfirmationTemplate(order.email, order._id, order.subTotal),
  });
  
  return { orderId: order._id, razorpayPaymentId };
};

module.exports = { createPaymentOrder, handlePaymentSuccess };
