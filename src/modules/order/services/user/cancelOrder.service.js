import mongoose from "mongoose";
import { AppError } from "#errors/AppError.js";
import ProductModel from "#modules/product/product.model.js";
import { ORDER, ERROR_CODES } from "#constants/index.js";
import OrderModel from "../../OrderModel/order.model.js";
import { assertOrderStatus } from "../../helpers/order.validators.js";
import { emailQueue } from "#queues/email.queue.js";
import { redisClient } from "#clients/redis.js";

const { ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS } = ORDER;

/**
 * @typedef {object} CancelledOrder
 * @property {string} _id
 * @property {string} orderId
 * @property {string} orderStatus
 * @property {string} shippingStatus
 * @property {string} paymentStatus
 */

/**
 * Cancels an order and reverts stock if paid
 *
 * @param {string} orderId
 * @param {string} userId
 * @returns {Promise<CancelledOrder>} cancelled order
 */
export const cancelOrder = async (orderId, userId) => {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const { orderStatus, shippingStatus } = order;
  assertOrderStatus(orderStatus, shippingStatus);

  const cancelledOrder = await cancelOrderWithStockReversal(orderId, userId);

  const cancelLabel = ORDER.ORDER_STATUS_EMAILS_LABELS.CANCELLED;
  if (cancelledOrder.email) {
    await emailQueue.add("order-cancelled-email", {
      template: "order-cancelled",
      to: cancelledOrder.email,
      subject: cancelLabel.subject,
      payload: {
        orderId: cancelledOrder.orderId,
        message: cancelLabel.message,
      },
    });
  }

  return cancelledOrder;
};

/**
 *
 * @param {string} orderId
 * @param {string} userId
 */
const cancelOrderWithStockReversal = async (orderId, userId) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existingOrder = await OrderModel.findOne({
      _id: orderId,
      isStockReverted: false,
      orderStatus: {
        $in: [ORDER_STATUS.CREATED, ORDER_STATUS.CONFIRMED],
      },
      shippingStatus: SHIPPING_STATUS.PENDING,
    }).session(session);

    if (!existingOrder) {
      throw new AppError(
        "Order not found or cannot be cancelled",
        404,
        ERROR_CODES.NOT_FOUND_ERROR,
      );
    }

    const isPaid =
      existingOrder.paymentStatus === PAYMENT_STATUS.PAID ||
      existingOrder.orderStatus === ORDER_STATUS.CONFIRMED;

    const targetPaymentStatus = isPaid
      ? PAYMENT_STATUS.REFUNDED
      : PAYMENT_STATUS.CANCELLED;

    const cancelledOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          isStockReverted: true,
          orderStatus: ORDER_STATUS.CANCELLED,
          shippingStatus: SHIPPING_STATUS.CANCELLED,
          paymentStatus: targetPaymentStatus,
        },
        $push: {
          orderStatusHistory: {
            status: ORDER_STATUS.CANCELLED,
            at: new Date(),
            by: userId,
          },
          paymentStatusHistory: {
            status: targetPaymentStatus,
            at: new Date(),
            by: userId,
          },
        },
      },
      {
        new: true,
        session,
      },
    );

    if (isPaid) {
      const bulkOperations = cancelledOrder.orderSnapshot.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: {
            $inc: { stock: item.quantity },
          },
        },
      }));

      await ProductModel.bulkWrite(bulkOperations, { session });
    }

    await session.commitTransaction();

    if (isPaid) {
      for (const item of cancelledOrder.orderSnapshot) {
        await redisClient.del(`product:${item.productId}`).catch(() => {});
      }
    }

    return cancelledOrder;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};
