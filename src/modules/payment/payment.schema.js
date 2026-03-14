const joi = require("joi");

const orderIdSchema = joi.object({
  orderId: joi.string().required(),
});

const paymentVerificationSchema = joi.object({
  razorpayOrderId: joi.string().required(),
  razorpayPaymentId: joi.string().required(),
  razorpaySignature: joi.string().required(),
});

module.exports = { orderIdSchema, paymentVerificationSchema };
