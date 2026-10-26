import { AppError } from "#errors/AppError.js";
import { ERROR_CODES, ROLES } from "#constants/index.js";
import OrderModel from "../../order.model.js";
import { getPOERefundsByPaymentId } from "#providers/paymentOrchestrator.provider.js";
import { logger } from "#utils/logger.js";

/**
 * Gets real-time refund details for an order
 *
 * @param {string} orderId - Mongo _id or custom orderId
 * @param {object} user - Authenticated user { userId, role }
 * @returns {Promise<{orderId: string, poePaymentId?: string, paymentStatus: string, refunds: Array<Object>}>}
 */
export const getOrderRefunds = async (orderId, user) => {
  const query = orderId.startsWith("EK-") ? { orderId } : { _id: orderId };

  if (user.role === ROLES.USER) {
    query.userId = user.userId;
  }

  const order = await OrderModel.findOne(query);

  if (!order) {
    throw new AppError("Order not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const poePaymentId = order.paymentDetails?.poePaymentId;
  if (!poePaymentId) {
    return {
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
      refunds: [],
    };
  }

  try {
    const refunds = await getPOERefundsByPaymentId(poePaymentId);
    return {
      orderId: order.orderId,
      poePaymentId,
      paymentStatus: order.paymentStatus,
      refunds,
    };
  } catch (error) {
    logger.warn(
      `Failed to fetch fresh refunds from POE for payment ${poePaymentId}: ${error.message}. Returning local order refunds.`,
    );
    return {
      orderId: order.orderId,
      poePaymentId,
      paymentStatus: order.paymentStatus,
      refunds: order.paymentDetails?.refunds || [],
    };
  }
};
