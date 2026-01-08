const joi = require("joi");

const ProductItems = joi.object({
  items: joi.array().items(
    joi.object({
      productId: joi.string(),
      quantity: joi.number().positive().min(1),
    })
  ),
});

module.exports = ProductItems;
