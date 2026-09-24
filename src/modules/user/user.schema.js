import joi from "joi";

import { ROLES } from "#constants/index.js";

export const updateProfileSchema = joi
  .object({
    name: joi.string().trim().min(2).max(50).optional(),
    phone: joi
      .string()
      .trim()
      .pattern(/^(\+91)?[6-9]\d{9}$/)
      .message(
        "Please enter a valid 10-digit Indian phone number (e.g. 9876543210 or +919876543210)",
      )
      .optional(),
  })
  .min(1);

export const adminUserQuerySchema = joi.object({
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(50).default(10),
  search: joi.string().trim().allow("").optional(),
  role: joi.string().valid(...Object.values(ROLES)).optional(),
  isActive: joi.string().valid("true", "false").optional(),
  sort: joi.string().trim().optional(),
});

export const adminUpdateUserSchema = joi
  .object({
    role: joi.string().valid(...Object.values(ROLES)).optional(),
    isActive: joi.boolean().optional(),
  })
  .min(1);

export const userIdParamSchema = joi.object({
  id: joi.string().hex().length(24).required().messages({
    "string.length": "Invalid user ID format",
    "string.hex": "Invalid user ID format",
  }),
});
