const {
  createPaymentOrder,
  handlePaymentsAndOrder,
} = require("../services/payments.service");

/**
 * Creates a Razorpay order that the client uses to open checkout
 */
const createPaymentController = async (req, res) => {
  const { items } = req.body;
  const { uid } = req.user;

  const order = await createPaymentOrder(items, uid);
  res.status(200).json(order);
};

/**
 * Verifies the payment signatures
 * Creates Order if verification is successful
 * Sends mail to the customer
 */
const paymentSuccessController = async (req, res) => {
  const {
    items,
    paymentDetails: { razorpayPaymentId, razorpaySignature, razorpayOrderId },
  } = req.body;

  const { userId, email } = req.user;

  const orderId = await handlePaymentsAndOrder({
    razorpayOrderId,
    razorpaySignature,
    razorpayPaymentId,
    userId,
    email,
    items,
  });

  res.status(200).json(orderId);
};
module.exports = { createPaymentController, paymentSuccessController };
