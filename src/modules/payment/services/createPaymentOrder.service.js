import OrderModel from "#modules/order/OrderModel/order.model.js";
import { AppError } from "#errors/AppError.js";
import { ORDER, ERROR_CODES } from "#constants/index.js";
import { createRazorpayOrder } from "../razorpay.provider.js";

const { PAYMENT_STATUS } = ORDER;

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
