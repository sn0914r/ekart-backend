import crypto from "crypto";
import mongoose from "mongoose";
import { AppError } from "#errors/AppError.js";
import OrderModel from "#modules/order/OrderModel/order.model.js";
import ProductModel from "#modules/product/product.model.js";
import { redisClient } from "#clients/redis.js";
import { configs } from "#configs/index.js";
import { ORDER, ERROR_CODES } from "#constants/index.js";
import { sendEmail } from "#providers/mailer/sendEmail.js";
import { orderConfirmationTemplate } from "#providers/mailer/templates/orderConfirmation.template.js";

const { ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS } = ORDER;

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

  await sendEmail(
    order.email,
    "Order Confirmed",
    orderConfirmationTemplate({
      orderId: order.orderId,
      totalAmount: order.subTotal,
    }),
  );

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
    paymentStatus: PAYMENT_STATUS.PAID,
  })
    .select("_id")
    .lean();

  if (order) {
    throw new AppError(
      `Payment already processed for ${order._id}`,
      409,
      ERROR_CODES.CONFLICT_ERROR,
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
    throw new AppError(
      "Invalid Payment",
      400,
      ERROR_CODES.INVALID_PAYMENT_SIGNATURE,
    );
  }
};

/**
 * @param {object} order
 * @param {{razorpayPaymentId: string, razorpaySignature: string}} paymentData - payment id and signature
 */
const updatePaymentStatus = async (
  order,
  { razorpayPaymentId, razorpaySignature },
) => {
  order.paymentStatus = PAYMENT_STATUS.PAID;
  order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
  order.paymentDetails.razorpaySignature = razorpaySignature;
  order.paymentDetails.failureCode = null;
  order.paymentDetails.failureReason = null;
  order.paymentDetails.failureDescription = null;
  order.paymentStatusHistory.push({
    status: PAYMENT_STATUS.PAID,
    at: new Date(),
    by: order.userId,
  });

  await order.save();
};

/**
 * Transaction for safe stock reduction
 *
 * @param {object} order
 * @param {string} userId
 */
const runTransaction = async (order, userId) => {
  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    for (let item of order.orderSnapshot) {
      const targetProduct = await ProductModel.findById(item.productId);

      // INFO: Edge cases
      if (!targetProduct || !targetProduct.isActive)
        throw new AppError(
          `${item.name ? item.name + " " : ""}Product not found`,
          404,
          ERROR_CODES.NOT_FOUND_ERROR,
        );

      if (targetProduct.stock < item.quantity)
        throw new AppError(
          `Product (${targetProduct.name}) out of stock`,
          400,
          ERROR_CODES.OUT_OF_STOCK,
        );

      // INFO: Reduce stock
      targetProduct.stock -= item.quantity;
      await targetProduct.save({ session });

      // INFO: Invalidate product cache
      await redisClient.del(`product:${item.productId}`);
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
