import { configs } from "#configs/index.js";
import { AppError } from "#errors/AppError.js";
import { logger } from "#utils/logger.js";

/**
 * Initiates a payment order with the Payment Orchestrator Engine (POE)
 *
 * @param {Object} params
 * @param {number} params.amount - Order amount in lowest denomination (e.g., paise)
 * @param {string} params.orderId - The ID of the order
 * @param {string} [params.method] - The preferred payment method
 * @param {Object} params.customer - Customer details
 * @param {string} params.customer.id - Customer ID
 * @param {string} params.customer.phone - Customer phone
 * @param {string} params.customer.email - Customer email
 * @param {string} params.idempotencyKey - Key to prevent duplicate requests
 * @returns {Promise<{paymentId: string, gateway: string}>}
 */
export const createPOEOrder = async ({
  amount,
  orderId,
  method,
  customer,
  idempotencyKey,
}) => {
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
};

/**
 * Initiates a refund with the Payment Orchestrator Engine (POE)
 *
 * @param {Object} params
 * @param {string} params.paymentId - The POE payment ID
 * @param {number} params.amountInRupees - The amount in INR to refund
 * @param {string} [params.reason] - Optional reason for refund
 * @param {string} params.idempotencyKey - Key to prevent duplicate refunds
 * @returns {Promise<{refundId: string, paymentId: string, gateway: string, gatewayRefundId: string, amountInRupees: number, status: string, reason?: string, createdAt: string}>}
 */
export const createPOERefund = async ({
  paymentId,
  amountInRupees,
  reason,
  idempotencyKey,
}) => {
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
};

/**
 * Fetches details of a specific refund by Refund ID
 *
 * @param {string} refundId - The POE refund ID
 * @returns {Promise<Object>}
 */
export const getPOERefundById = async (refundId) => {
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
};

/**
 * Lists all refunds for a specific POE payment ID
 *
 * @param {string} paymentId - The POE payment ID
 * @returns {Promise<Array<Object>>}
 */
export const getPOERefundsByPaymentId = async (paymentId) => {
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
};
