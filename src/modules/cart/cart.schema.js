import joi from "joi";

export const CartItemProductIdSchema = joi.object({
  productId: joi.string().required(),
});

export const AddToCartSchema = joi.object({
  productId: joi.string().required(),
  variant: joi
    .object({
      size: joi.string().required(),
    })
    .required(),
});
