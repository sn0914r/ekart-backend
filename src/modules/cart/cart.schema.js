import joi from "joi";

export const CartItemProductIdSchema = joi.object({
  productId: joi.string().hex().length(24).required().messages({
    "string.length": "Product ID must be a 24-character hexadecimal ID",
    "string.hex": "Product ID must be a valid hexadecimal string",
    "any.required": "Product ID is required",
  }),
});

export const AddToCartSchema = joi.object({
  productId: joi.string().hex().length(24).required().messages({
    "string.length": "Product ID must be a 24-character hexadecimal ID",
    "string.hex": "Product ID must be a valid hexadecimal string",
    "any.required": "Product ID is required",
  }),
  variant: joi
    .object({
      size: joi.string().required(),
    })
    .required(),
});

export const RemoveCartItemParamSchema = joi.object({
  id: joi.string().hex().length(24).required().messages({
    "string.length": "Product ID must be a 24-character hexadecimal ID",
    "string.hex": "Product ID must be a valid hexadecimal string",
    "any.required": "Product ID is required",
  }),
});
