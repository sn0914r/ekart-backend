import bcrypt from "bcryptjs";
import UserModel from "../../../models/User.model.js";
import RefreshTokenModel from "../../../models/RefreshTokens.model.js";
import { ERROR_CODES } from "../../../constants/errorCodes.js";
import { AppError } from "../../../errors/AppError.js";
import { ROLES } from "../../../constants/roles.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateAuthTokens.js";
import { hashToken } from "../utils/hashToken.js";

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export const createUser = async (name, email, password) => {
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    throw new AppError("Email already exists", 409, ERROR_CODES.CONFLICT_ERROR);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role: ROLES.USER,
  });

  const refreshTokenDoc = await RefreshTokenModel.create({
    userId: newUser._id,
  });

  const refreshToken = generateRefreshToken({
    sessionId: refreshTokenDoc._id,
    userId: newUser._id,
  });

  const accessToken = generateAccessToken({
    userId: newUser._id,
    role: newUser.role,
    name: newUser.name,
    email: newUser.email,
  });

  const hashedRefreshToken = hashToken(refreshToken);

  const expireDate = new Date();
  // FIXME: get the expire time from the configs (normalize string)
  expireDate.setDate(expireDate.getDate() + 7);
  await RefreshTokenModel.findByIdAndUpdate(refreshTokenDoc._id, {
    hashedToken: hashedRefreshToken,
    expiresAt: expireDate,
  });

  return { accessToken, refreshToken };
};
