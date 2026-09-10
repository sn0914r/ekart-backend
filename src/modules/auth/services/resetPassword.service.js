import { redisClient } from "#clients/redis.js";
import { ERROR_CODES } from "#constants/errorCodes.js";
import { AppError } from "#errors/AppError.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import UserModel from "../models/user.model.js";

/**
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export const resetPassword = async (token, newPassword) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const key = `password-reset-user:${tokenHash}`;
  const userId = await redisClient.get(key);

  if (!userId) {
    throw new AppError(
      "Token expired or Invalid Token",
      400,
      ERROR_CODES.TOKEN_EXPIRED,
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await UserModel.findByIdAndUpdate(userId, {
    password: hashedPassword,
  });

  return;
};
