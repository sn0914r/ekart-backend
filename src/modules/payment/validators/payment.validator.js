const AppError = require("../../../errors/AppError");
const crypto = require("crypto");
const configs = require("../../../configs/index");
const { ERROR_CODES } = require("../../../constants/errorCodes");


const validatePaymentSignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const generatedSignature = crypto
    .createHmac("sha256", configs.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature)
    throw new AppError("Order not found", 401, ERROR_CODES.NOT_FOUND_ERROR);
};

module.exports = { validatePaymentSignature };
