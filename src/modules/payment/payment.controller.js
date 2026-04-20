const { logger } = require("../../utils/logger");
const {
  createPaymentOrder,
  handlePaymentSuccess,
} = require("./payment.service");

/**
 * @route POST /payments/create
 * @access Private
 * @desc Creates a razorpay payment order
 */
const createPaymentController = async (req, res) => {
  const { orderId } = req.body;
  const { uid } = req.user;

  logger.info("uid: " + uid);
  logger.info("orderId: " + orderId);

  const paymentDetails = await createPaymentOrder({
    uid,
    orderId,
  });
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

  const { uid } = req.user;

  logger.info(`[RAZORPAY PAYMENT ID]: ${razorpayPaymentId}`);
  logger.info(`[RAZORPAY ORDER ID]: ${razorpayOrderId}`);
  logger.info(`[RAZORPAY SIGNATURE]: ${razorpaySignature}`);

  const orderId = await handlePaymentSuccess({
    razorpayOrderId,
    razorpaySignature,
    razorpayPaymentId,
    uid,
  });

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    data: orderId,
  });
};

module.exports = { createPaymentController, paymentSuccessController };
