import { ORDER, ERROR_CODES } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";
import { sendEmail } from "#providers/mailer/sendEmail.js";
import { orderShippingStatusTemplate } from "#providers/mailer/templates/orderShippingStatus.template.js";
import OrderModel from "../../OrderModel/order.model.js";
import { validateShippingStatusTransition } from "../../helpers/order.validators.js";

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

  const orderStatus = ORDER.ORDER_STATUS_EMAIL_LABELS[shippingStatus];
  if (orderStatus && order.email) {
    await sendEmail(
      order.email,
      orderStatus["subject"],
      orderShippingStatusTemplate({
        orderId: order.orderId,
        status: shippingStatus,
        message: orderStatus["message"],
      }),
    );
  }

  return { shippingStatus: order.shippingStatus };
};
