import { handlePaymentFailure } from "./services/handlePaymentFailure.service.js";
import { createPaymentOrder, handlePaymentSuccess } from "./services/index.js";

/**
 * @route POST /payments/create
 * @access Private
 * @desc Creates a razorpay payment order
 */
export const createPaymentController = async (req, res) => {
  const { orderId } = req.body;
  const { userId } = req.user;

  const paymentDetails = await createPaymentOrder(orderId, userId);

  res.status(200).json({
    success: true,
    message: "Payment order created successfully",
    data: paymentDetails,
  });
};

/**
 * @route POST /payments/success
 * @access Private
 * @desc Verifies the payment and confirms the order
 */
export const paymentSuccessController = async (req, res) => {
  const { razorpayPaymentId, razorpaySignature, razorpayOrderId } = req.body;
  const { userId } = req.user;

  const orderId = await handlePaymentSuccess(
    {
      razorpayOrderId,
      razorpaySignature,
      razorpayPaymentId,
    },
    userId,
  );

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    data: orderId,
  });
};

/**
 * @route POST /payments/failure
 * @access Private
 */

export const paymentFailureController = async (req, res) => {
  const paymentFailureDetails = req.body;
  const userId = req.user.userId;

  await handlePaymentFailure(paymentFailureDetails, userId);

  await res.status(200).json({
    success: true,
    message: "Payment Failed",
  });
};
