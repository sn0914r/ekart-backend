import { logger } from "#utils/logger.js";
import { initiatePayment } from "./services/initiatePayment.service.js";
import { verifyPayment } from "./services/verifyPayment.service.js";

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
  await verifyPayment(req.body);
  res.status(200).json({ success: true, message: "Webhook processed" });
};
