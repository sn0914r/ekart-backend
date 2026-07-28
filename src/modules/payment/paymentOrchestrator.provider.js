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
