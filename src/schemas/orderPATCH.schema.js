const joi = require("joi");

const OrderPATCHSchema = joi.object({
  orderStatus: joi
    .string()
    .valid("created", "confirmed", "cancelled")
    .optional(),

  shippingStatus: joi
    .string()
    .valid("pending", "shipped", "delivered", "cancelled")
    .optional(),

  trackingId: joi.string().optional(),
});

module.exports = OrderPATCHSchema;
