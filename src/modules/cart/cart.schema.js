const joi = require("joi");

const CartSchema = joi.object({
  items: joi.array().items(
    joi.object({
      productId: joi.string(),
      quantity: joi.number(),
    }),
  ),
});

module.exports = { CartSchema };
