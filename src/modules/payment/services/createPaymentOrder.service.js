const { ERROR_CODES } = require("../../../constants/errorCodes");
const { PAYMENT_STATUS } = require("../../../constants/order");
const AppError = require("../../../errors/AppError");
const OrderModel = require("../../../models/Order/Order.model");
const { createRazorpayOrder } = require("../../../providers/razorpay");

/**
 * Create a razorpay payment orders
 *
 * @param {string} orderId - order id
 * @param {string} userId - user id
 * @returns {object} {razorpayOrderId: string} - Payment Order details
 */
const createPaymentOrder = async (orderId, userId) => {
  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const razorpayOrderId = await createRazorpayOrder(order.subTotal, userId);

  order.paymentDetails = order.paymentDetails || {};
  order.paymentDetails.razorpayOrderId = razorpayOrderId;
  order.paymentStatusPaidHistory = {
    status: PAYMENT_STATUS.PENDING,
    at: new Date(),
    by: order.userId,
  };

  await order.save();
  return { razorpayOrderId };
};

module.exports = { createPaymentOrder };
