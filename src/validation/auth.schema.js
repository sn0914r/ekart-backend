const joi = require("joi");

const registerUserSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required().min(6).alphanum(),
  confirmPassword: joi.ref("password"),
});

module.exports = { registerUserSchema };
