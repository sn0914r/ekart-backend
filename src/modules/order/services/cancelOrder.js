const AppError = require("../../../errors/AppError");
const mongoose = require("mongoose");
const OrderModel = require("../../../models/Order/Order.model");
const ProductModel = require("../../../models/Product.model");
const { ORDER_STATUS, SHIPPING_STATUS } = require("../../../constants/order");
const { logger } = require("../../../utils/logger");
const { ERROR_CODES } = require("../../../constants/errorCodes");

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
        },
        $push: {
          orderStatusHistory: {
            status: ORDER_STATUS.CANCELLED,
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
        "Order cannot be cancelled or already processed",
        400,
        ERROR_CODES.BAD_REQUEST_ERROR,
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
    logger.error("Error in cancelling order: " + error);
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = { cancelOrderWithStockReversal };
