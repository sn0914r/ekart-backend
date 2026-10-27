import joi from "joi";

export const orderIdSchema = joi.object({
  orderId: joi.string().hex().length(24).required(),
});

export const initiatePaymentSchema = joi.object({
  orderId: joi.string().hex().length(24).required(),
  method: joi.string().optional(),
});
