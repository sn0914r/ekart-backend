import bcrypt from "bcryptjs";
import { AppError } from "#errors/AppError.js";
import { configs } from "#configs/index.js";
import { ROLES, ERROR_CODES } from "#constants/index.js";
import UserModel from "../models/user.model.js";
import RefreshTokenModel from "../models/refreshTokens.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../auth.utils.js";
import { emailQueue } from "#queues/email.queue.js";

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
  expireDate.setDate(
    expireDate.getDate() + configs.auth_jwt.refreshTokenExpireTime,
  );

  await RefreshTokenModel.findByIdAndUpdate(refreshTokenDoc._id, {
    hashedToken: hashedRefreshToken,
    expiresAt: expireDate,
  });

  await emailQueue.add("welcome-email", {
    template: "welcome-email",
    to: email,
    subject: "Welcome to eKart!",
    payload: { name: newUser.name },
  });

  return { accessToken, refreshToken, userId: newUser._id };
};
