const joi = require("joi");

const createProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().required().positive(),
  isActive: joi.boolean().required().default(true),
});

module.exports = createProductSchema;
