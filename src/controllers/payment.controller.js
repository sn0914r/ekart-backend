const {
  createPaymentOrder,
  handlePaymentsAndOrder,
} = require("../services/payments.service");

/**
 * Creates a Razorpay order that the client uses to open checkout
 */
const createPaymentController = async (req, res) => {
  const { orderId } = req.body;
  const { uid: userId, email } = req.user;

  const paymentDetails = await createPaymentOrder({
    userId,
    email,
    orderId,
  });
  res.status(200).json({ ...paymentDetails });
};

/**
 * Verifies the payment signatures
 * Creates Order if verification is successful
 * Sends mail to the customer
 */
const paymentSuccessController = async (req, res) => {
  const { razorpayPaymentId, razorpaySignature, razorpayOrderId } = req.body;

  const { uid: userId } = req.user;

  const orderId = await handlePaymentsAndOrder({
    razorpayOrderId,
    razorpaySignature,
    razorpayPaymentId,
    userId,
  });

  res.status(200).json(orderId);
};
module.exports = { createPaymentController, paymentSuccessController };
