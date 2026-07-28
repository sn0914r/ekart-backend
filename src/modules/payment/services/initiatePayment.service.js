import { nanoid } from "nanoid";
import { ERROR_CODES } from "#constants/errorCodes.js";
import { ORDER } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";
import OrderModel from "#modules/order/OrderModel/order.model.js";
import { createPOEOrder } from "../paymentOrchestrator.provider.js";
import { logger } from "#utils/logger.js";

/**
 * Initiates a new payment session with the payment orchestrator
 *
 * @param {string} orderId - The ID of the order
 * @param {string} userId - The ID of the user creating the payment
 * @param {string} [method] - The preferred payment method (optional)
 * @returns {Promise<Object>} Payment details returned from the orchestrator
 */
export const initiatePayment = async (orderId, userId, method) => {
  const order = await OrderModel.findOne({ _id: orderId, userId });

  console.log({ orderId, userId });

  if (!order) {
    throw new AppError(
      "Order not found, payment failed",
      404,
      ERROR_CODES.NOT_FOUND_ERROR,
    );
  }

  const idempotencyKey = nanoid();

  const customerPhone = order.shippingAddress.phone;
  const customerEmail = order.email;
  const orderAmountInRupees = order.subTotal;

  const paymentDetails = await createPOEOrder({
    amount: orderAmountInRupees,
    orderId,
    method,
    customer: {
      id: userId,
      phone: customerPhone,
      email: customerEmail,
    },
    idempotencyKey,
  });

  const { paymentId, gateway } = paymentDetails;

  order.paymentDetails = order.paymentDetails || {};
  order.paymentDetails.poePaymentId = paymentId;
  order.paymentDetails.gateway = gateway;
  order.paymentDetails.paymentMethod = method;

  const lastHistory =
    order.paymentStatusHistory[order.paymentStatusHistory.length - 1];
  if (!lastHistory || lastHistory.status !== ORDER.PAYMENT_STATUS.PENDING) {
    order.paymentStatusHistory.push({
      status: ORDER.PAYMENT_STATUS.PENDING,
      at: new Date(),
      by: userId,
    });
  }

  await order.save();

  logger.info("PAYMENT INITIATED");
  logger.info(JSON.stringify(paymentDetails));

  return paymentDetails;
};
