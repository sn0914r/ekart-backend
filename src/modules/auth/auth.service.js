const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const configs = require("../../configs");
const AppError = require("../../errors/AppError");
const UserModel = require("../../models/User.model");
const generateAuthTokens = require("./utils/generateAuthTokens");
const { ERROR_CODES } = require("../../constants/errorCodes");
const { ROLES } = require("../../constants/roles");

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

  const payload = {
    userId: newUser._id,
    role: newUser.role,
    name: newUser.name,
    email: newUser.email,
  };
  const { accessToken, refreshToken } = await generateAuthTokens(payload);

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
    throw new AppError(
      "Invalid email or password",
      401,
      ERROR_CODES.BAD_REQUEST_ERROR,
    );
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError(
      "Invalid email or password",
      401,
      ERROR_CODES.BAD_REQUEST_ERROR,
    );
  }

  const payload = {
    userId: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  };
  const { accessToken, refreshToken } = await generateAuthTokens(payload);
  return { accessToken, refreshToken };
};

/**
 * @param {string} refreshToken
 * @return {string} accessToken
 */
const refreshToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, configs.jwtSecret.refresh);
  const user = await UserModel.findById(decoded.userId);

  if (!user || refreshToken !== user.refreshToken) {
    throw new AppError(
      "Invalid refresh, Please Login again",
      401,
      ERROR_CODES.BAD_REQUEST_ERROR,
    );
  }

  const payload = {
    userId: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  };
  const accessToken = jwt.sign(payload, configs.jwtSecret.access, {
    expiresIn: configs.jwtSecret.accessTokenExpireTime,
  });

  return accessToken;
};

/**
 * @param {string} refreshToken
 */
const logoutUser = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, configs.jwtSecret.refresh);
    await UserModel.findOneAndUpdate(
      { _id: decoded.userId, refreshToken },
      { refreshToken: null },
    );
  } catch (err) {}

  return;
};

module.exports = { createUser, loginUser, refreshToken, logoutUser };
