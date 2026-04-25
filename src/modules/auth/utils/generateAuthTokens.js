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
  const accessToken = jwt.sign(payload, configs.jwtSecret.access, {
    expiresIn: configs.jwtSecret.accessTokenExpireTime,
  });

  const refreshToken = jwt.sign(payload, configs.jwtSecret.refresh, {
    expiresIn: configs.jwtSecret.refreshTokenExpireTime,
  });

  await UserModel.findByIdAndUpdate(payload.userId, {
    refreshToken,
  });

  return { accessToken, refreshToken };
};

module.exports = generateAuthTokens;
