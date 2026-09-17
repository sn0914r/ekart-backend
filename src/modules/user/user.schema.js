import joi from "joi";

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
