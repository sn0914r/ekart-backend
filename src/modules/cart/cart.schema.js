const joi = require("joi");

const CartRequestSchema = joi.object({
  productId: joi.string().required(),
});
const AddToCartRequestSchema = joi.object({
  productId: joi.string().required(),
  variant: joi
    .object({
      size: joi.string().required(),
    })
    .required(),
});

module.exports = { CartRequestSchema, AddToCartRequestSchema };
