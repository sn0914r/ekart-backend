import { PAYMENT_STATUS } from "../../../constants/order.js";
import OrderModel from "../../../models/Order/Order.model.js";

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
