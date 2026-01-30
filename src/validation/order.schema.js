const joi = require("joi");

const paymentSchema = joi.object({
  razorpayOrderId: joi.string(),
  razorpayPaymentId: joi.string(),
  razorpaySignature: joi.string(),
});

const updateOrderSchema = joi.object({
  orderStatus: joi
    .string()
    .uppercase()
    .valid("CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED")
    .optional(),
});

module.exports = { paymentSchema, updateOrderSchema };
