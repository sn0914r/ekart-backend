const joi = require("joi");

const createOrderSchema = joi.object({
  items: joi
    .array()
    .items(
      joi.object({
        id: joi.string().required(),
        quantity: joi.number().required().min(1),
      }),
    )
    .min(1)
    .required(),
});

const updateOrderStatusSchema = joi.object({
  orderStatus: joi
    .string()
    .uppercase()
    .valid("CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED")
    .optional(),
});

const orderIdSchema = joi.string().required();
module.exports = { createOrderSchema, updateOrderStatusSchema };
