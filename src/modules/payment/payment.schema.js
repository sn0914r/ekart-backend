import joi from "joi";

export const orderIdSchema = joi.object({
  orderId: joi.string().required(),
});

export const initiatePaymentSchema = joi.object({
  orderId: joi.string().required(),
  method: joi.string().optional(),
});
