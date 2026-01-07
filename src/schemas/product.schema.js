const joi = require("joi");

const ProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().required().positive(),
  imageUrl: joi.string().required(),
  isActive: joi.boolean().required().default(true),
  createdAt: joi.date().required().default(Date.now()),
  updatedAt: joi.date().required().default(Date.now()),
});

module.exports = ProductSchema;
