import joi from "joi";
import { ORDER } from "#constants/index.js";

export const createOrderSchema = joi.object({
  shippingAddress: joi.object({
    name: joi.string().required(),
    address: joi.string().min(25).required(),
    phone: joi
      .string()
      .pattern(/^\+91\d{10}$/)
      .required(),
    city: joi.string().required(),
    state: joi.string().required(),
    country: joi.string().optional(),
    pincode: joi.string().required(),
  }),
});

export const updateOrderStatusSchema = joi.object({
  orderStatus: joi.string().uppercase().valid("CANCELLED").optional(),
});

export const updateShippingStatusSchema = joi.object({
  shippingStatus: joi
    .string()
    .uppercase()
    .valid(...Object.values(ORDER.SHIPPING_STATUS))
    .optional(),
});
