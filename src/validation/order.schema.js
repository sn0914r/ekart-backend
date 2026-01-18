const joi = require("joi");

const orderSchema = joi.object({
  items: joi.array().items(
    joi.object({
      id: joi.string(),
      quantity: joi.number().positive().min(1),
    }),
  ),

  paymentDetails: {
    razorpayOrderId: joi.string(),
    razorpayPaymentId: joi.string(),
    razorpaySignature: joi.string(),
  },
});

const updateOrderSchema = joi.object({
  orderStatus: joi
    .string()
    .uppercase()
    .valid("CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED")
    .optional(),
});

module.exports = { orderSchema, updateOrderSchema };
