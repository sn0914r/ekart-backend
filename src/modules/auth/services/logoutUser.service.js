import RefreshTokenModel from "../models/refreshTokens.model.js";
import jwt from "jsonwebtoken";
import { configs } from "../../../configs/index.js";

/**
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
export const logoutUser = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, configs.auth_jwt.refreshSecret, {
      ignoreExpiration: true,
    });
    const sessionId = decoded.sessionId;

    if (sessionId) {
      await RefreshTokenModel.findByIdAndDelete(sessionId);
    }
  } catch {
    // INFO: Token is completely invalid, but user wants to log out anyway, so we just proceed
  }
};
