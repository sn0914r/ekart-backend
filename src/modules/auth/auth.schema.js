const joi = require("joi");

const registerUserSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required().min(6),
});

const loginUserSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required().min(6),
});

const refreshTokenSchema = joi.object({
  refreshToken: joi.string().required(),
});

module.exports = { registerUserSchema, loginUserSchema, refreshTokenSchema };
