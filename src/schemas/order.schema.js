const joi = require("joi");

const OrderSchema = joi.object({
  userId: joi.string().required(),
  items: joi.array().items(
    joi
      .object({
        productId: joi.string().required(),
        name: joi.string().required(),
        quantity: joi.number().required().positive(),
        price: joi.number().required().positive(),
      })
      .min(1)
  ),
  totalAmount: joi.number().required().positive(),
  paymentStatus: joi
    .string()
    .valid("created", "paid", "failed")
    .default("created"),
  paymentDetails: {
    razorpayOrderId: joi.string(),
    razorpayPaymentId: joi.string(),
    razorpaySignature: joi.string(),
  },

  orderStatus: joi
    .string()
    .valid("created", "confirmed", "delivered", "cancelled")
    .default("created"),

  shippingStatus: joi
    .string()
    .valid("pending", "shipped", "delivered", "cancelled")
    .default("pending"),

  trackingId: joi.string(),
  createdAt: joi.date().required().default(Date.now()),
  updatedAt: joi.date().required().default(Date.now()),
});

module.exports = OrderSchema;