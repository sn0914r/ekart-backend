import joi from "joi";

export const registerUserSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required().min(6),
});

export const loginUserSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required().min(6),
});

export const refreshTokenSchema = joi.object({
  refreshToken: joi.string().required(),
});
