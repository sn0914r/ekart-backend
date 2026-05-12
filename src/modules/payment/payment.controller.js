const { logger } = require("../../utils/logger");
const {
  createPaymentOrder,
  handlePaymentSuccess,
} = require("./services");

/**
 * @route POST /payments/create
 * @access Private
 * @desc Creates a razorpay payment order
 */
const createPaymentController = async (req, res) => {
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
const paymentSuccessController = async (req, res) => {
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

module.exports = { createPaymentController, paymentSuccessController };
