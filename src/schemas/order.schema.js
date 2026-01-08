const joi = require("joi");

const OrderSchema = joi.object({
  items: joi.array().items(
    joi
      .object({
        productId: joi.string().required(),
        quantity: joi.number().required().positive(),
      })
      .min(1)
  ),
  paymentDetails: {
    razorpayOrderId: joi.string(),
    razorpayPaymentId: joi.string(),
    razorpaySignature: joi.string(),
  },
});

module.exports = OrderSchema;
