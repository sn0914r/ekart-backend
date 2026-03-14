const joi = require("joi");

const addProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().positive().required(),
  stock: joi.number().positive().required(),
  isActive: joi.boolean().default(true),
});

const updateProductSchema = joi
  .object({
    name: joi.string().optional(),
    price: joi.number().positive().optional(),
    stock: joi.number().positive().optional(),
    isActive: joi.boolean().optional(),
  })
  .min(1);

module.exports = {
  addProductSchema,
  updateProductSchema,
};
