import { AppError } from "../../../../errors/AppError.js";
import OrderModel from "../../../../models/Order/Order.model.js";
import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { createTimeline } from "../../utils/createOrderTimeline.js";

/** @import {TimelineEntry} from "../../utils/createOrderTimeline.js" */

/**
 * @param {string} userId
 * @param {string} orderId
 * @returns {Promise<object & TimelineEntry[]>}
 */
export const getOrder = async (userId, orderId) => {
  const order = await OrderModel.findById(orderId, {
    orderId: 1,
    userId: 1,
    email: 1,
    orderSnapshot: 1,
    subTotal: 1,
    orderStatus: 1,
    paymentStatus: 1,
    shippingStatus: 1,
    orderStatusHistory: 1,
    shippingStatusHistory: 1,
    shippingAddress: 1,
    createdAt: 1,
    paymentStatusHistory: 1,
    paymentDetails: 1,
  });

  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  if (order.userId !== userId)
    throw new AppError(
      "You are not authorized to access this order",
      403,
      ERROR_CODES.FORBIDDEN_ERROR,
    );

  const timeline = createTimeline(
    order.paymentStatusHistory,
    order.orderStatusHistory,
    order.shippingStatusHistory,
  );

  const {
    _orderStatusHistory,
    _paymentStatusHistory,
    _shippingStatusHistory,
    ...orderResponse
  } = order._doc;

  return { ...orderResponse, timeline };
};
