import mongoose from "mongoose";
import { AppError } from "#errors/AppError.js";
import ProductModel from "#modules/product/product.model.js";
import { ORDER, ERROR_CODES } from "#constants/index.js";
import OrderModel from "../../OrderModel/order.model.js";
import { assertOrderStatus } from "../../helpers/order.validators.js";

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
 * Cancels an order and reverts stock
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

  await cancelOrderWithStockReversal(orderId, userId);

  await order.save();

  return order;
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
    const order = await OrderModel.findOneAndUpdate(
      {
        _id: orderId,
        isStockReverted: false,
        orderStatus: {
          $in: [ORDER_STATUS.CREATED, ORDER_STATUS.CONFIRMED],
        },
        shippingStatus: SHIPPING_STATUS.PENDING,
      },
      {
        $set: {
          isStockReverted: true,
          orderStatus: ORDER_STATUS.CANCELLED,
          shippingStatus: SHIPPING_STATUS.CANCELLED,
          paymentStatus: PAYMENT_STATUS.REFUND_PENDING,
        },
        $push: {
          orderStatusHistory: {
            status: ORDER_STATUS.CANCELLED,
            at: new Date(),
            by: userId,
          },
          paymentStatusHistory: {
            status: PAYMENT_STATUS.REFUND_PENDING,
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

    if (!order)
      throw new AppError(
        "Order not found or cannot be cancelled",
        404,
        ERROR_CODES.NOT_FOUND_ERROR,
      );

    const bulkOperations = order.orderSnapshot.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: {
          $inc: { stock: item.quantity },
        },
      },
    }));

    await ProductModel.bulkWrite(bulkOperations, { session });

    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};
