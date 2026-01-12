const crypto = require("crypto");

const razorpay = require("../configs/razorpay.config");

const { calculateCartTotal } = require("./pricing.service");
const AppError = require("../errors/AppError");
const { createOrder } = require("./order.service");
const { sendOrderConfirmation } = require("./email.service");

/**
 * Creates an order at razorpay server
 */
const createPaymentOrder = async (items, uid) => {
  const totalAmount = await calculateCartTotal(items);

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: `receipt_${uid.slice(0, 5)}_${Date.now()}`,
  };

  // NOTE: the razorpay receipt must be lessthan 40 chars
  const order = await razorpay.orders.create(options);
  return order;
};

/**
 * Verifies the payment using payment signatures
 */
const verifyPaymentSignatures = async (
  orderId,
  paymentId,
  razorpaySignature
) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new AppError("Invalid payment", 400);
  }
};

/**
 * Service Entry point for VerifyPaymentController
 *
 * Flow:
 *  - Verifies the signatures
 *  - Calculates total Amount
 *  - Creates Order
 *  - Notifies the customer
 *
 * @returns {string} Order Id
 */
const handlePaymentsAndOrder = async ({
  razorpaySignature,
  razorpayOrderId,
  razorpayPaymentId,

  userId,
  email,

  items,
}) => {
  const timestamp = new Date();

  await verifyPaymentSignatures(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  const totalAmount = await calculateCartTotal(items);

  const orderId = await createOrder({
    userId,
    email,
    items,
    totalAmount,
    paymentDetails: {
      razorpayOrderId,
      razorpaySignature,
      razorpayPaymentId,
    },
    orderStatus: "created",
    shippingStatus: "pending",
    currency: "INR",
    paymentStatus: "paid",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await sendOrderConfirmation({
    email,
    totalAmount,
    timestamp,
    orderId,
  });
  return orderId;
};

module.exports = { createPaymentOrder, handlePaymentsAndOrder };
