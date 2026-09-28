import { initiatePayment } from "./services/initiatePayment.service.js";
import { verifyPayment } from "./services/verifyPayment.service.js";
import { logger } from "#utils/logger.js";

/**
 * @route POST /payments/initiate
 * @access Private
 * @desc Initiates a new payment session for an order with the payment orchestrator
 */
export const initiatePaymentController = async (req, res) => {
  const { orderId, method } = req.body;
  const { userId } = req.user;

  const paymentDetails = await initiatePayment(orderId, userId, method);

  res.status(200).json({
    success: true,
    message: "Payment order created successfully",
    data: paymentDetails,
  });
};

/**
 * @route POST /payments/webhook/verify
 * @access Private
 * @desc Verifies the payment orchestrator webhook payload and updates order payment status
 */
export const verifyPaymentController = async (req, res) => {
  logger.info(`WEBHOOK RECEIVED: ${JSON.stringify(req.body)}`);
  await verifyPayment(req.body);
  logger.info(`WEBHOOK PROCESSED for orderId: ${req.body?.orderId}`);
  res.status(200).json({ success: true, message: "Webhook processed" });
};
