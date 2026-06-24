import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { AppError } from "../../../../errors/AppError.js";
import OrderModel from "../../OrderModel/order.model.js";
import { createTimeline } from "../../utils/createOrderTimeline.js";

/** @import {TimelineEntry} from "../../utils/createOrderTimeline.js" */

/**
 * @param {string} orderId
 * @returns {Promise<object & {timeline: TimelineEntry[]}>}
 */
export const getOrderForAdmin = async (orderId) => {
  const order = await OrderModel.findById(orderId);
  if (!order)
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);

  const timeline = createTimeline(
    order.paymentStatusHistory,
    order.orderStatusHistory,
    order.shippingStatusHistory,
  );

  return { ...order._doc, timeline };
};
