const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const configs = require("../../configs");
const AppError = require("../../errors/AppError");
const UserModel = require("../../models/User.model");
const { ERROR_CODES } = require("../../constants/errorCodes");
const { ROLES } = require("../../constants/roles");
const RefreshTokenModel = require("../../models/RefreshTokens.model");
const {
  generateRefreshToken,
  generateAccessToken,
} = require("./utils/generateAuthTokens");
const { hashToken } = require("./utils/hashToken");

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @return {object} { accessToken, refreshToken }
 */
const createUser = async (name, email, password) => {
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

/**
 * @param {string} email
 * @param {string} password
 * @return {object} {accessToken, refreshToken}
 */
const loginUser = async (email, password) => {
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
  // FIXME: get the expire time from the configs (normalize string)
  expires.setDate(expires.getDate() + 7);

  await RefreshTokenModel.findByIdAndUpdate(refreshTokenDoc._id, {
    hashedToken: hashedRefreshToken,
    expiresAt: expires,
  });

  return { accessToken, refreshToken };
};

/**
 * @param {string} refreshToken
 * @return {string} accessToken
 */
const refreshToken = async (refreshToken) => {
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

  const accessToken = generateAccessToken({
    userId: userDoc._id,
    role: userDoc.role,
    name: userDoc.name,
    email: userDoc.email,
  });

  return accessToken;
};

/**
 * @param {string} refreshToken
 */
const logoutUser = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, configs.auth_jwt.refreshSecret);
  const sessionId = decoded.sessionId;

  await RefreshTokenModel.findByIdAndDelete(sessionId);
  return;
};

module.exports = { createUser, loginUser, refreshToken, logoutUser };
