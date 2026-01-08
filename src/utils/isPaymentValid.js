const crypto = require("crypto");
const isPaymentValid = (orderId, paymentId, razorpaySignature) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return razorpaySignature === generatedSignature;
};

module.exports = isPaymentValid;
