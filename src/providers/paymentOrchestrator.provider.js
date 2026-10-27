import { configs } from "#configs/index.js";
import { AppError } from "#errors/AppError.js";
import { logger } from "#utils/logger.js";

export class PaymentOrchestratorProvider {
  /**
   * Initiates a payment order with the Payment Orchestrator Engine (POE)
   *
   * @param {Object} params
   * @param {number} params.amount
   * @param {string} params.orderId
   * @param {string} [params.method]
   * @param {Object} params.customer
   * @param {string} params.customer.id
   * @param {string} params.customer.phone
   * @param {string} params.customer.email
   * @param {string} params.idempotencyKey
   * @returns {Promise<{paymentId: string, gateway: string}>}
   */
  static async createOrder({
    amount,
    orderId,
    method,
    customer,
    idempotencyKey,
  }) {
    logger.info("SENDING REQUEST TO POE");

    const apiResponse = await fetch(
      `${configs.paymentService.apiUrl}/payments/initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": idempotencyKey,
          "x-api-key": configs.paymentService.Secret,
        },
        body: JSON.stringify({
          amount,
          method,
          orderId,
          customer,
        }),
      },
    );

    logger.info("POE REQUEST COMPLETES");

    const paymentDetails = await apiResponse.json();

    if (!paymentDetails.success) {
      logger.error(JSON.stringify(paymentDetails));
      throw new AppError(
        paymentDetails.message,
        apiResponse.status,
        paymentDetails.errorCode,
        paymentDetails.errors || null,
      );
    }

    return paymentDetails.data;
  }

  /**
   * Initiates a refund with the Payment Orchestrator Engine (POE)
   *
   * @param {Object} params
   * @param {string} params.paymentId
   * @param {number} params.amountInRupees
   * @param {string} [params.reason]
   * @param {string} params.idempotencyKey
   * @returns {Promise<object>}
   */
  static async createRefund({
    paymentId,
    amountInRupees,
    reason,
    idempotencyKey,
  }) {
    logger.info("SENDING REFUND REQUEST TO POE");

    const apiResponse = await fetch(
      `${configs.paymentService.apiUrl}/refunds`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": idempotencyKey,
          "x-api-key": configs.paymentService.Secret,
        },
        body: JSON.stringify({
          paymentId,
          amountInRupees,
          reason,
        }),
      },
    );

    logger.info("POE REFUND REQUEST COMPLETES");

    const refundDetails = await apiResponse.json();

    if (!refundDetails.success) {
      logger.error(`POE REFUND FAILED: ${JSON.stringify(refundDetails)}`);
      throw new AppError(
        refundDetails.message,
        apiResponse.status,
        refundDetails.errorCode,
        refundDetails.errors || null,
      );
    }

    return refundDetails.data;
  }

  /**
   * Fetches details of a specific refund by Refund ID
   *
   * @param {string} refundId
   * @returns {Promise<Object>}
   */
  static async getRefundById(refundId) {
    const apiResponse = await fetch(
      `${configs.paymentService.apiUrl}/refunds/${refundId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": configs.paymentService.Secret,
        },
      },
    );

    const data = await apiResponse.json();

    if (!data.success) {
      throw new AppError(data.message, apiResponse.status, data.errorCode);
    }

    return data.data;
  }

  /**
   * Lists all refunds for a specific POE payment ID
   *
   * @param {string} paymentId
   * @returns {Promise<Array<Object>>}
   */
  static async getRefundsByPaymentId(paymentId) {
    const apiResponse = await fetch(
      `${configs.paymentService.apiUrl}/refunds/payment/${paymentId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": configs.paymentService.Secret,
        },
      },
    );

    const data = await apiResponse.json();

    if (!data.success) {
      throw new AppError(data.message, apiResponse.status, data.errorCode);
    }

    return data.data;
  }
}
