const crypto = require("crypto");

const razorpay = require("../configs/razorpay.config");

const calculateCartTotal = require("./pricing.service");
const AppError = require("../errors/AppError");

const createPaymentOrder = async (items, uid) => {
  const totalAmount = calculateCartTotal(items);

  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: `receipt_${uid}_${Date.now()}`,
  };
  const order = await razorpay.orders.create(options);
  return order;
};

const verifyPaymentSignatures = async (razorpaySignature) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new AppError("Invalid payment", 400);
  }
};

module.exports = { createPaymentOrder, verifyPaymentSignatures };
