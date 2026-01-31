const paymentService = require("../services/payments.service");

/**
 * @desc Creates a razorpay payment order
 *
 * Preconditions:
 *  - Request is authenticated
 *  - req.body.orderId is valid
 *
 * @route POST /payments/create
 * @access Private
 */
const createPaymentController = async (req, res) => {
  const { orderId } = req.body;
  const { uid: userId, email } = req.user;

  const paymentDetails = await paymentService.createPaymentOrder({
    userId,
    email,
    orderId,
  });
  res.status(200).json({ ...paymentDetails });
};

/**
 * @desc Verifies the payment and confirms the order
 *
 * Preconditions:
 *  - Request is authenticated
 *  - req.body contains valid razorpayPaymentId, razorpayOrderId, and razorpaySignature
 *
 * @route POST /payments/success
 * @access Private
 */
const paymentSuccessController = async (req, res) => {
  const { razorpayPaymentId, razorpaySignature, razorpayOrderId } = req.body;

  const { uid: userId } = req.user;

  const orderId = await paymentService.handlePaymentSuccess({
    razorpayOrderId,
    razorpaySignature,
    razorpayPaymentId,
    userId,
  });

  res.status(200).json(orderId);
};
module.exports = { createPaymentController, paymentSuccessController };
