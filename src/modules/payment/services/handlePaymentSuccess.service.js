import { AppError } from "../../../errors/AppError.js";
import OrderModel from "../../../models/Order/Order.model.js";
import ProductModel from "../../../models/Product.model.js";
import { configs } from "../../../configs/index.js";
import mongoose from "mongoose";
import { ERROR_CODES } from "../../../constants/errorCodes.js";
import crypto from "crypto";
import { sendMail } from "../../../providers/nodemailer.js";
import { orderConfirmation } from "../../../templates/orderConfirmation.js";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} from "../../../constants/order.js";

/**
 * Verifies payment and confirms order
 *
 * @param {{razorpaySignature: string, razorpayOrderId: string, razorpayPaymentId: string}} paymentData
 * @param {string} userId
 * @returns {Promise<{orderId: string, razorpayPaymentId: string, totalAmount: number, email: string}>}
 */

export const handlePaymentSuccess = async (paymentData, userId) => {
  const { razorpayOrderId, razorpayPaymentId } = paymentData;

  await idempotencyCheck(razorpayPaymentId);
  validatePaymentSignatures(paymentData);

  const order = await OrderModel.findOne({
    "paymentDetails.razorpayOrderId": razorpayOrderId,
  });

  await updatePaymentStatus(order, paymentData);
  await runTransaction(order, userId);

  sendConfirmationMail(order);
  return {
    orderId: order.orderId,
    razorpayPaymentId,
    totalAmount: order.subTotal,
    email: order.email,
  };
};

/**
 * @param {string} razorpayPaymentId
 */
const idempotencyCheck = async (razorpayPaymentId) => {
  const order = await OrderModel.findOne({
    "paymentDetails.razorpayPaymentId": razorpayPaymentId,
  })
    .select("_id")
    .lean();

  if (order) {
    throw new AppError(
      `Payment already processed for ${order._id}`,
      409,
      ERROR_CODES.BAD_REQUEST_ERROR,
    );
  }
};

/**
 * @param {{razorpaySignature: string, razorpayOrderId: string, razorpayPaymentId: string}} paymentData
 */
const validatePaymentSignatures = (paymentData) => {
  const generatedSignature = crypto
    .createHmac("sha256", configs.razorpay.keySecret)
    .update(`${paymentData.razorpayOrderId}|${paymentData.razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== paymentData.razorpaySignature) {
    throw new AppError("Invalid Payment", 400, ERROR_CODES.BAD_REQUEST_ERROR);
  }
};

/**
 * @param {object} order
 * @param {{razorpayPaymentId: string, razorpaySignature: string}}
 */
const updatePaymentStatus = async (
  order,
  { razorpayPaymentId, razorpaySignature },
) => {
  order.paymentStatus = PAYMENT_STATUS.PAID;
  order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
  order.paymentDetails.razorpaySignature = razorpaySignature;
  order.paymentStatusPaidHistory = {
    status: PAYMENT_STATUS.PAID,
    at: new Date(),
    by: order.userId,
  };

  await order.save();
};

/**
 * Transaction for safe stock reduction
 *
 * @param {object} Order
 * @param {string} userId
 */
const runTransaction = async (order, userId) => {
  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    for (let item of order.orderSnapshot) {
      const targetProduct = await ProductModel.findById(item.productId);

      // INFO: Edge cases
      if (!targetProduct)
        throw new AppError(
          `Product (${item.name}) not found`,
          404,
          ERROR_CODES.NOT_FOUND_ERROR,
        );

      if (!targetProduct.isActive)
        throw new AppError(
          "Product not available",
          408,
          ERROR_CODES.BAD_REQUEST_ERROR,
        );

      if (targetProduct.stock < item.quantity)
        throw new AppError(
          `Product (${targetProduct.name}) out of stock`,
          409,
          ERROR_CODES.BAD_REQUEST_ERROR,
        );

      // INFO: Reduce stock
      targetProduct.stock -= item.quantity;
      await targetProduct.save({ session });
    }

    // INFO: Save order
    order.orderStatus = ORDER_STATUS.CONFIRMED;
    order.orderStatusHistory.push({
      status: ORDER_STATUS.CONFIRMED,
      at: new Date(),
      by: userId,
    });
    order.shippingStatusHistory = [
      { status: SHIPPING_STATUS.PENDING, at: new Date(), by: userId },
    ];
    await order.save({ session });
  });

  await session.endSession();
};

/**
 * @param {object} order
 */
const sendConfirmationMail = (order) => {
  sendMail({
    to: order.email,
    subject: "Order has been placed successfully",
    template: orderConfirmation(order.email, order._id, order.subTotal),
  });
};
