const mongoose = require("mongoose");
const AppError = require("../../errors/AppError");
const razorpay = require("../../lib/razorpay");
const nodemailer = require("../../integrations/nodemailer");
const ProductModel = require("../../models/Product.model");
const OrderModel = require("../../models/Order/Order.model");
const { ERROR_CODES } = require("../../constants/errorCodes");
const { PAYMENT_STATUS, ORDER_STATUS } = require("../../constants/order");
const { validatePaymentSignature } = require("./validators/payment.validator");
const orderConfirmationTemplate = require("../../templates/orderConfirmation");
const { logger } = require("../../lib/nodemailer");

/**
 * Creates a razorpay payment order
 *
 * @param {string} uid - user id
 * @param {string} orderId - order id
 * @returns {object} {razorpayOrderId: string, amount: number} - Payment order details
 * @throws {AppError} If order not found
 */
const createPaymentOrder = async ({ uid, orderId }) => {
  const order = await OrderModel.findById(orderId);

  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  const RAZORPAY_OPTIONS = {
    amount: order.subTotal * 100,
    currency: order.currency || "INR",
    receipt: `receipt_${uid.slice(0, 4)}_${Date.now()}`, // note: the razorpay receipt must be lessthan 40 chars
  };

  const razorpayOrder = await razorpay.orders.create(RAZORPAY_OPTIONS);

  order.paymentDetails = order.paymentDetails || {};
  order.paymentDetails.razorpayOrderId = razorpayOrder.id;

  await order.save();

  logger.info("Payment order created successfully");
  logger.info("Razorpay order created" + JSON.stringify(razorpayOrder));

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
  };
};

/**
 * Verifies the payment and confirms the order
 *
 * @param {string} razorpaySignature
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} uid
 * @returns {object} { orderId: string, razorpayPaymentId: string }
 */
const handlePaymentSuccess = async ({
  razorpaySignature,
  razorpayOrderId,
  razorpayPaymentId,
  uid,
}) => {
  let order;
  // Idempotency check
  order = await OrderModel.findOne({
    "paymentDetails.razorpayPaymentId": razorpayPaymentId,
  });
  if (order)
    throw new AppError(
      `Payment already processed for ${order._id}`,
      409,
      ERROR_CODES.BAD_REQUEST_ERROR,
    );

  validatePaymentSignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  order = await OrderModel.findOne({
    "paymentDetails.razorpayOrderId": razorpayOrderId,
  });

  order.paymentStatus = PAYMENT_STATUS.PAID;
  order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
  order.paymentDetails.razorpaySignature = razorpaySignature;
  await order.save();

  const orderSnapshot = order.orderSnapshot;
  if (!orderSnapshot)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  // Transaction for atomicity
  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    for (const item of orderSnapshot) {
      // read the product
      const targetProduct = await ProductModel.findOne({ _id: item.productId });

      if (!targetProduct) {
        throw new AppError(
          `Product (${item.name}) not found`,
          404,
          ERROR_CODES.NOT_FOUND_ERROR,
        );
      }
      if (!targetProduct.isActive)
        throw new AppError(
          "Product is not available",
          409,
          ERROR_CODES.BAD_REQUEST_ERROR,
        );
      if (targetProduct.stock < item.quantity) {
        throw new AppError(
          `Product (${targetProduct.name}) out of stock`,
          409,
          ERROR_CODES.BAD_REQUEST_ERROR,
        );
      }

      // reduce stock
      targetProduct.stock -= item.quantity;
      await targetProduct.save();
    }

    // save the order
    order.orderStatus = ORDER_STATUS.CONFIRMED;
    order.orderStatusHistory.push({
      status: ORDER_STATUS.CONFIRMED,
      at: new Date(),
      by: uid,
    });
    await order.save();
  });
  await session.endSession();

  // Sends email
  nodemailer.sendMail({
    to: order.email,
    subject: "Order has been placed successfully",
    template: orderConfirmationTemplate(order.email, order._id, order.subTotal),
  });

  return { orderId: order._id, razorpayPaymentId };
};

module.exports = { createPaymentOrder, handlePaymentSuccess };
