import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { configs } from "#configs/index.js";
import { AppError } from "#errors/AppError.js";
import { ERROR_CODES } from "#constants/index.js";
import { redisClient } from "#clients/redis.js";
import { emailQueue } from "#queues/email.queue.js";
import { AuthRepository } from "./auth.repository.js";

export class AuthService {
  /**
   * @param {{userId: string, role: string, name: string, email: string}} payload
   * @returns {string}
   */
  static #generateAccessToken(payload) {
    return jwt.sign(payload, configs.auth_jwt.accessSecret, {
      expiresIn: configs.auth_jwt.accessTokenExpireTime,
    });
  }

  /**
   * @param {{sessionId: string, userId: string}} payload
   * @returns {string}
   */
  static #generateRefreshToken(payload) {
    return jwt.sign(payload, configs.auth_jwt.refreshSecret, {
      expiresIn: configs.auth_jwt.refreshTokenExpireTime,
    });
  }

  /**
   * @param {string} token
   * @returns {string}
   */
  static #hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Encapsulates creating a session, generating JWTs, and persisting the hashed token.
   * @param {object} user
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  static async #createSessionAndTokens(user) {
    const session = await AuthRepository.createRefreshTokenSession(user._id);

    const refreshToken = AuthService.#generateRefreshToken({
      sessionId: session._id,
      userId: user._id,
    });

    const accessToken = AuthService.#generateAccessToken({
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const hashedRefreshToken = AuthService.#hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + configs.auth_jwt.refreshTokenExpireTime,
    );

    await AuthRepository.updateRefreshTokenSession(session._id, {
      hashedToken: hashedRefreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  /**
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{accessToken: string, refreshToken: string, userId: string}>}
   */
  static async registerUser(name, email, password) {
    const existingUser = await AuthRepository.findUserByEmail(email);

    if (existingUser) {
      throw new AppError(
        "Email already exists",
        409,
        ERROR_CODES.CONFLICT_ERROR,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await AuthRepository.createNewUser({
      name,
      email,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } =
      await AuthService.#createSessionAndTokens(newUser);

    await emailQueue.add("welcome-email", {
      template: "welcome-email",
      to: email,
      subject: "Welcome to eKart!",
      payload: { name: newUser.name },
    });

    return { accessToken, refreshToken, userId: newUser._id };
  }

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{accessToken: string, refreshToken: string, userId: string, name: string}>}
   */
  static async loginUser(email, password) {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    if (user.isDeleted || !user.isActive) {
      throw new AppError(
        "Your account has been deactivated. Please contact support.",
        403,
        ERROR_CODES.FORBIDDEN_ERROR,
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new AppError(
        "Incorrect password",
        401,
        ERROR_CODES.UNAUTHORIZED_ERROR,
      );
    }

    const { accessToken, refreshToken } =
      await AuthService.#createSessionAndTokens(user);

    return { accessToken, refreshToken, userId: user._id, name: user.name };
  }

  /**
   * @param {string} refreshTokenString
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   */
  static async refreshAccessToken(refreshTokenString) {
    if (!refreshTokenString) {
      throw new AppError(
        "Refresh token missing",
        401,
        ERROR_CODES.UNAUTHORIZED_ERROR,
      );
    }

    const decoded = jwt.verify(
      refreshTokenString,
      configs.auth_jwt.refreshSecret,
    );
    const sessionId = decoded.sessionId;

    const session = await AuthRepository.findRefreshTokenSessionById(sessionId);

    if (!session) {
      throw new AppError(
        "Session expired. Please login again",
        401,
        ERROR_CODES.UNAUTHORIZED_ERROR,
      );
    }

    const generatedHash = AuthService.#hashToken(refreshTokenString);

    if (generatedHash !== session.hashedToken) {
      throw new AppError(
        "Invalid refresh token",
        401,
        ERROR_CODES.UNAUTHORIZED_ERROR,
      );
    }

    const user = await AuthRepository.findUserById(decoded.userId);

    if (!user || user.isDeleted || !user.isActive) {
      throw new AppError(
        "Your account is inactive or not found",
        401,
        ERROR_CODES.UNAUTHORIZED_ERROR,
      );
    }

    const newRefreshToken = AuthService.#generateRefreshToken({
      sessionId: session._id,
      userId: user._id,
    });

    const hashedNewRefreshToken = AuthService.#hashToken(newRefreshToken);

    await AuthRepository.updateRefreshTokenSession(sessionId, {
      hashedToken: hashedNewRefreshToken,
    });

    const accessToken = AuthService.#generateAccessToken({
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * @param {string} refreshTokenString
   * @returns {Promise<void>}
   */
  static async logoutUser(refreshTokenString) {
    try {
      const decoded = jwt.verify(
        refreshTokenString,
        configs.auth_jwt.refreshSecret,
        { ignoreExpiration: true },
      );
      const sessionId = decoded?.sessionId;

      if (sessionId) {
        await AuthRepository.deleteRefreshTokenSessionById(sessionId);
      }
    } catch {
      // INFO: proceeds silently even if token is expired or invalid
    }
  }

  /**
   * @param {string} email
   * @returns {Promise<void>}
   */
  static async forgotPassword(email) {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = AuthService.#hashToken(rawToken);

    const key = `password-reset-user:${tokenHash}`;
    await redisClient.setex(key, 900, user._id.toString());

    await emailQueue.add("password-reset-mail", {
      template: "password-reset",
      to: email,
      subject: "Reset your password",
      payload: {
        resetLink: `${configs.frontendOrigin}/reset-password?token=${rawToken}`,
        name: user.name,
        expiresIn: "15 minutes",
      },
    });
  }

  /**
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  static async resetPassword(token, newPassword) {
    if (!token) {
      throw new AppError(
        "Token is required",
        400,
        ERROR_CODES.BAD_REQUEST_ERROR,
      );
    }

    const tokenHash = AuthService.#hashToken(token);

    const key = `password-reset-user:${tokenHash}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      throw new AppError(
        "Token expired or Invalid Token",
        400,
        ERROR_CODES.TOKEN_EXPIRED,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await AuthRepository.updateUserPasswordById(userId, hashedPassword);
  }
}
