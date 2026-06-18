import mongoose from "mongoose";
import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { AppError } from "../../../../errors/AppError.js";
import OrderModel from "../../../../models/Order/Order.model.js";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
} from "../../../../constants/order.js";
import ProductModel from "../../../../models/Product.model.js";
import { assertOrderStatus } from "../../order.validators.js";

/**
 * Updates the User's Order Status
 *
 * @param {string} orderId
 * @param {string} userId
 * @param {object} updates - { orderStatus, shippingAddress }
 * @returns {object} updated order
 */
export const updateOrderStatus = async (orderId, userId) => {
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
