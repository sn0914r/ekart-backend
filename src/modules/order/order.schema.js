const joi = require("joi");
const { SHIPPING_STATUS } = require("../../constants/order");

const createOrderSchema = joi.object({
  items: joi
    .array()
    .items(
      joi.object({
        productId: joi.string().required(),
        quantity: joi.number().required().min(1),
      }),
    )
    .min(1)
    .required(),
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

const updateOrderSchema = joi.object({
  orderStatus: joi.string().uppercase().valid("CANCELLED").optional(),
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

const updateShippingStatusSchema = joi.object({
  shippingStatus: joi
    .string()
    .uppercase()
    .valid(...Object.values(SHIPPING_STATUS))
    .optional(),
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  updateShippingStatusSchema,
};
