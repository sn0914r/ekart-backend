import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { AppError } from "../../../../errors/AppError.js";
import OrderModel from "../../../../models/Order/Order.model.js";
import { validateShippingStatusTransition } from "../../order.validators.js";

/**
 * @param {string} orderId
 * @param {string} userId
 * @param {string} shippingStatus
 * @returns {Promise<{shippingStatus: string}>}
 */
export const updateOrderByAdmin = async (orderId, userId, shippingStatus) => {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  validateShippingStatusTransition(order.shippingStatus, shippingStatus);

  order.shippingStatus = shippingStatus;

  order.shippingStatusHistory.push({
    status: shippingStatus,
    at: new Date(),
    by: userId,
  });

  await order.save();

  return { shippingStatus: order.shippingStatus };
};
