import joi from "joi";
import { PRODUCT } from "#constants/index.js";

const categoryValues = Object.values(PRODUCT.CATEGORIES);

export const addProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().positive().required(),
  stock: joi.number().positive().required(),
  isActive: joi.boolean().default(true),
  description: joi.string().required(),
  category: joi
    .string()
    .valid(...categoryValues)
    .required(),
  attributes: joi
    .object({
      color: joi.string().required(),
      size: joi.array().items(joi.string()).required(),
    })
    .required(),
});

export const updateProductSchema = joi
  .object({
    name: joi.string().optional(),
    price: joi.number().positive().optional(),
    stock: joi.number().positive().optional(),
    isActive: joi.boolean().optional(),
    description: joi.string().optional(),
    category: joi
      .string()
      .valid(...categoryValues)
      .optional(),
    attributes: joi
      .object({
        color: joi.string().required(),
        size: joi.array().items(joi.string()).required(),
      })
      .optional(),
  })
  .min(1);
