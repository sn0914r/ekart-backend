import joi from "joi";

export const addWishlistItemSchema = joi.object({
  productId: joi.string().hex().length(24).required().messages({
    "string.length": "Product ID must be a 24-character hexadecimal ID",
    "string.hex": "Product ID must be a valid hexadecimal string",
    "any.required": "Product ID is required",
  }),
});

export const wishlistItemParamSchema = joi.object({
  productId: joi.string().hex().length(24).required().messages({
    "string.length": "Product ID must be a 24-character hexadecimal ID",
    "string.hex": "Product ID must be a valid hexadecimal string",
    "any.required": "Product ID is required",
  }),
});
