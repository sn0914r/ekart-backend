import { ORDER } from "#constants/index.js";
import OrderModel from "#modules/order/OrderModel/order.model.js";

const { PAYMENT_STATUS } = ORDER;

/**
 * @typedef {object} PaymentFailureData
 * @property {string} orderId
 * @property {string} razorpayOrderId
 * @property {string} razorpayPaymentId
 * @property {string} failureCode
 * @property {string} failureReason
 * @property {string} failureDescription
 */

/**
 * Records a payment failure against an order
 *
 * @param {PaymentFailureData} paymentFailureData
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const handlePaymentFailure = async (
  {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    failureCode,
    failureReason,
    failureDescription,
  },
  userId,
) => {
  await OrderModel.findByIdAndUpdate(orderId, {
    paymentStatus: PAYMENT_STATUS.FAILED,
    paymentDetails: {
      razorpayOrderId,
      razorpayPaymentId,
      failureCode,
      failureReason,
      failureDescription,
    },
    $push: {
      paymentStatusHistory: {
        status: PAYMENT_STATUS.FAILED,
        at: new Date(),
        by: userId,
      },
    },
  });
};
