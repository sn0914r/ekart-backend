import { nanoid } from "nanoid";
import { ERROR_CODES, ORDER } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";
import { PaymentOrchestratorProvider } from "#providers/paymentOrchestrator.provider.js";
import { redisClient } from "#clients/redis.js";
import { emailQueue } from "#queues/email.queue.js";
import { logger } from "#utils/logger.js";
import { PaymentRepository } from "./payment.repository.js";

export class PaymentService {
  /**
   * @param {{orderId: string, userId: string, method?: string}} params
   * @returns {Promise<object>}
   */
  static async initiatePayment({ orderId, userId, method }) {
    const order = await PaymentRepository.findOrderById(orderId, userId);

    if (!order) {
      throw new AppError(
        "Order not found, payment failed",
        404,
        ERROR_CODES.NOT_FOUND_ERROR,
      );
    }

    const idempotencyKey = nanoid();
    const customerPhone = order.shippingAddress?.phone;
    const customerEmail = order.email;
    const orderAmountInRupees = order.subTotal;

    const paymentDetails = await PaymentOrchestratorProvider.createOrder({
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

    const lastHistory =
      order.paymentStatusHistory?.[order.paymentStatusHistory.length - 1];
    const pushHistory =
      !lastHistory || lastHistory.status !== ORDER.PAYMENT_STATUS.PENDING;

    await PaymentRepository.updatePaymentInitiation(orderId, {
      paymentId,
      gateway,
      method,
      userId,
      pushHistory,
    });

    logger.info("PAYMENT INITIATED");
    logger.info(JSON.stringify(paymentDetails));

    const resolvedKey = paymentDetails.keyId || paymentDetails.key;

    return {
      ...paymentDetails,
      key: resolvedKey,
      keyId: resolvedKey,
      razorpayKeyId: resolvedKey,
    };
  }

  /**
   * @param {object} payload
   * @returns {Promise<void>}
   */
  static async verifyPaymentWebhook(payload) {
    const order = await PaymentRepository.findOrderById(payload.orderId);

    if (!order || order.paymentStatus === ORDER.PAYMENT_STATUS.PAID) {
      return;
    }

    const orderPaymentStatus = PaymentService.#mapPoeStatusToEkartStatus(
      payload.status,
    );

    if (payload.status === "success") {
      const { updatedProductIds } =
        await PaymentRepository.deductStockAndConfirmOrder(order, {
          paymentStatus: orderPaymentStatus,
          paymentId: payload.paymentId,
          gateway: payload.gateway,
          method: payload.method,
          userId: order.userId,
        });

      await Promise.all(
        updatedProductIds.map((productId) =>
          redisClient.del(`product:${productId}`),
        ),
      );

      await emailQueue.add("order-confirmation-email", {
        template: "order-confirmation",
        to: order.email,
        subject: "Order Confirmed",
        payload: {
          orderId: order.orderId,
          totalAmount: order.subTotal,
        },
      });
    } else {
      await PaymentRepository.updatePaymentStatus(order._id, {
        paymentStatus: orderPaymentStatus,
        paymentId: payload.paymentId,
        gateway: payload.gateway,
        method: payload.method,
        userId: order.userId,
      });
    }
  }

  /**
   * @param {string} poeStatus
   * @returns {string}
   */
  static #mapPoeStatusToEkartStatus(poeStatus) {
    const { PAYMENT_STATUS } = ORDER;

    switch (poeStatus) {
      case "initiated":
      case "processing":
        return PAYMENT_STATUS.PENDING;
      case "success":
        return PAYMENT_STATUS.PAID;
      case "failed":
        return PAYMENT_STATUS.FAILED;
      case "partially_refunded":
        return PAYMENT_STATUS.PARTIALLY_REFUNDED;
      case "refunded":
        return PAYMENT_STATUS.REFUNDED;
      default:
        return PAYMENT_STATUS.PENDING;
    }
  }
}
