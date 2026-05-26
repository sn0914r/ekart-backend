const jwt = require("jsonwebtoken");
const configs = require("../../../configs");

const generateAccessToken = (payload) => {
  const accessToken = jwt.sign(payload, configs.auth_jwt.accessSecret, {
    expiresIn: configs.auth_jwt.accessTokenExpireTime,
  });

  return accessToken;
};

const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign(payload, configs.auth_jwt.refreshSecret, {
    expiresIn: configs.auth_jwt.refreshTokenExpireTime,
  });

  return refreshToken;
};

module.exports = { generateAccessToken, generateRefreshToken };
