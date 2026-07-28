import mongoose from "mongoose";
import { ORDER, ERROR_CODES } from "#constants/index.js";
import OrderModel from "#modules/order/OrderModel/order.model.js";
import ProductModel from "#modules/product/product.model.js";
import { AppError } from "#errors/AppError.js";
import { mapPoeStatusToEkartStatus } from "../payment.helpers.js";
import { redisClient } from "#clients/redis.js";
import { emailQueue } from "#queues/email.queue.js";

/**
 * Verifies the payment webhook payload and updates order status
 *
 * @param {Object} payload - The webhook payload from the payment orchestrator
 * @param {string} payload.orderId - The ID of the order
 * @param {string} payload.status - The status of the payment (e.g., 'success', 'failed')
 * @param {string} payload.paymentId - The orchestrator's payment ID
 * @param {string} payload.gateway - The gateway used for payment
 * @param {string} [payload.method] - The payment method used
 * @returns {Promise<void>}
 */
export const verifyPayment = async (payload) => {
  const order = await OrderModel.findById(payload.orderId);

  if (!order || order.paymentStatus === ORDER.PAYMENT_STATUS.PAID) return;

  order.paymentStatus = mapPoeStatusToEkartStatus(payload.status);
  order.paymentDetails.poePaymentId = payload.paymentId;
  order.paymentDetails.gateway = payload.gateway;
  order.paymentDetails.paymentMethod = payload.method;

  order.paymentStatusHistory.push({
    status: order.paymentStatus,
    at: new Date(),
    by: order.userId,
  });

  if (payload.status === "success") {
    await stockReduction(order, order.userId);

    await emailQueue.add("order-confirmation-email", {
      template: "order-confirmation",
      to: order.email,
      subject: "Order Confirmed",
      payload: {
        orderId: order.orderId,
        totalAmount: order.subTotal,
      },
    });
  } else {
    await order.save();
  }
};

/**
 * Transaction for safe stock reduction
 *
 * @param {object} order
 * @param {string} userId
 */
const stockReduction = async (order, userId) => {
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
    order.orderStatus = ORDER.ORDER_STATUS.CONFIRMED;
    order.orderStatusHistory.push({
      status: ORDER.ORDER_STATUS.CONFIRMED,
      at: new Date(),
      by: userId,
    });
    order.shippingStatusHistory = [
      { status: ORDER.SHIPPING_STATUS.PENDING, at: new Date(), by: userId },
    ];
    await order.save({ session });
  });

  await session.endSession();
};
