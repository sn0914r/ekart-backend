const jwt = require("jsonwebtoken");
const configs = require("../../../configs");
const UserModel = require("../../../models/User.model");

/**
 * Generates access and refresh tokens
 *
 * @param {string} payload {userId, role}
 * @returns {object} {accessToken, refreshToken}
 */
const generateAuthTokens = async (payload) => {
  const accessToken = jwt.sign(payload, configs.auth_jwt.accessSecret, {
    expiresIn: configs.auth_jwt.accessTokenExpireTime,
  });

  const refreshToken = jwt.sign(payload, configs.auth_jwt.refreshSecret, {
    expiresIn: configs.auth_jwt.refreshTokenExpireTime,
  });

  await UserModel.findByIdAndUpdate(payload.userId, {
    refreshToken,
  });

  return { accessToken, refreshToken };
};

module.exports = generateAuthTokens;
