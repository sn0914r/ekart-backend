import OrderModel from "../../../models/Order/Order.model.js";
import { AppError } from "../../../errors/AppError.js";
import { createRazorpayOrder } from "../../../providers/razorpay.js";
import { ERROR_CODES } from "../../../constants/errorCodes.js";
import { PAYMENT_STATUS } from "../../../constants/order.js";

/**
 * @param {string} orderId
 * @param {string} userId
 * @returns {Promise<{razorpayOrderId: string}>}
 */
export const createPaymentOrder = async (orderId, userId) => {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const razorpayOrderId = await createRazorpayOrder(order.subTotal, userId);

  order.paymentDetails = order.paymentDetails || {};
  order.paymentDetails.razorpayOrderId = razorpayOrderId;
  order.paymentStatusHistory.push({
    status: PAYMENT_STATUS.PENDING,
    at: new Date(),
    by: userId,
  });

  await order.save();
  return { razorpayOrderId };
};
