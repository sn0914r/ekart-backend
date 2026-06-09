import jwt from "jsonwebtoken";
import { configs } from "../../../configs/index.js";

/**
 * @param {{userId: string, role: string, name: string, email: string}} payload
 * @returns {string} accessToken
 */
export const generateAccessToken = (payload) => {
  const accessToken = jwt.sign(payload, configs.auth_jwt.accessSecret, {
    expiresIn: configs.auth_jwt.accessTokenExpireTime,
  });

  return accessToken;
};

/**
 * @param {{sessionId: string, userId: string}} payload
 * @returns {string} refreshToken
 */
export const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign(payload, configs.auth_jwt.refreshSecret, {
    expiresIn: configs.auth_jwt.refreshTokenExpireTime,
  });

  return refreshToken;
};
