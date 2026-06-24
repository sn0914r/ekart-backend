import jwt from "jsonwebtoken";
import { configs } from "../../../configs/index.js";
import UserModel from "../models/user.model.js";
import RefreshTokenModel from "../models/refreshTokens.model.js";
import { ERROR_CODES } from "../../../constants/errorCodes.js";
import { AppError } from "../../../errors/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateAuthTokens.js";
import { hashToken } from "../utils/hashToken.js";

/**
 * @param {string} refreshToken
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export const refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError(
      "Refresh token missing",
      401,
      ERROR_CODES.UNAUTHORIZED_ERROR,
    );
  }

  const decoded = jwt.verify(refreshToken, configs.auth_jwt.refreshSecret);
  const sessionId = decoded.sessionId;

  const refreshTokenDoc = await RefreshTokenModel.findById(sessionId);

  if (!refreshTokenDoc) {
    throw new AppError(
      "Session expired. Please login again",
      401,
      ERROR_CODES.UNAUTHORIZED_ERROR,
    );
  }

  const generatedHash = hashToken(refreshToken);

  const isHashMatched = generatedHash === refreshTokenDoc.hashedToken;
  if (!isHashMatched) {
    throw new AppError(
      "Invalid refresh token",
      401,
      ERROR_CODES.UNAUTHORIZED_ERROR,
    );
  }

  const userId = decoded.userId;
  const userDoc = await UserModel.findById(userId);

  const newRefreshToken = generateRefreshToken({
    sessionId: refreshTokenDoc._id,
    userId: userId,
  });

  const hashedNewRefreshToken = hashToken(newRefreshToken);

  await RefreshTokenModel.findByIdAndUpdate(sessionId, {
    hashedToken: hashedNewRefreshToken,
  });

  const accessToken = generateAccessToken({
    userId: userDoc._id,
    role: userDoc.role,
    name: userDoc.name,
    email: userDoc.email,
  });

  return { accessToken, refreshToken: newRefreshToken };
};
