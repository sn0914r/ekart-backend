import { PaymentService } from "./payment.service.js";
import { logger } from "#utils/logger.js";

export class PaymentController {
  /**
   * @route POST /payments/initiate
   * @access Private
   */
  static async initiatePayment(req, res) {
    const { orderId, method } = req.body;
    const { userId } = req.user;

    const paymentDetails = await PaymentService.initiatePayment({
      orderId,
      userId,
      method,
    });

    res.status(200).json({
      success: true,
      message: "Payment order created successfully",
      data: paymentDetails,
    });
  }

  /**
   * @route POST /payments/webhook/verify
   * @access Private
   */
  static async verifyPaymentWebhook(req, res) {
    logger.info(`WEBHOOK RECEIVED: ${JSON.stringify(req.body)}`);
    await PaymentService.verifyPaymentWebhook(req.body);
    logger.info(`WEBHOOK PROCESSED for orderId: ${req.body?.orderId}`);
    res.status(200).json({ success: true, message: "Webhook processed" });
  }
}
