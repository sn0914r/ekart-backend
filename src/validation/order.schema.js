const joi = require("joi");

const orderSchema = joi.object({
  items: joi.array().items(
    joi.object({
      id: joi.string(),
      quantity: joi.number().positive().min(1),
    })
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
    .valid("created", "confirmed", "cancelled")
    .optional(),

  shippingStatus: joi
    .string()
    .valid("pending", "shipped", "delivered", "cancelled")
    .optional(),
});

module.exports = { orderSchema, updateOrderSchema };
