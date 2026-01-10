const joi = require("joi");

const addProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().required().positive(),
  isActive: joi.boolean().required().default(true),
});

const cartItemsSchema = joi.array().items(
  joi.object({
    id: joi.string(),
    quantity: joi.number().positive().min(1),
  })
);

module.exports = { addProductSchema, cartItemsSchema };
