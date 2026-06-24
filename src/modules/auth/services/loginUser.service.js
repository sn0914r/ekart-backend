import bcrypt from "bcryptjs";
import UserModel from "../models/user.model.js";
import RefreshTokenModel from "../models/refreshTokens.model.js";
import { ERROR_CODES } from "../../../constants/errorCodes.js";
import { AppError } from "../../../errors/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateAuthTokens.js";
import { hashToken } from "../utils/hashToken.js";
import { configs } from "../../../configs/index.js";

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export const loginUser = async (email, password) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError(
      "Incorrect password",
      401,
      ERROR_CODES.UNAUTHORIZED_ERROR,
    );
  }

  const refreshTokenDoc = await RefreshTokenModel.create({
    userId: user._id,
  });

  const refreshToken = generateRefreshToken({
    sessionId: refreshTokenDoc._id,
    userId: user._id,
  });

  const accessToken = generateAccessToken({
    userId: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  const hashedRefreshToken = hashToken(refreshToken);

  const expires = new Date();
  expires.setDate(expires.getDate() + configs.auth_jwt.refreshTokenExpireTime);

  await RefreshTokenModel.findByIdAndUpdate(refreshTokenDoc._id, {
    hashedToken: hashedRefreshToken,
    expiresAt: expires,
  });

  return { accessToken, refreshToken, userId: user._id, name: user.name };
};
