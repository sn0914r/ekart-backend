import { configs } from "#configs/index.js";
import { forgotPassword } from "./services/forgotPassword.service.js";
import {
  createUser,
  loginUser,
  refreshToken,
  logoutUser,
} from "./services/index.js";
import { resetPassword } from "./services/resetPassword.service.js";

/**
 * @route POST /auth/register
 * @access Public
 */
export const createUserController = async (req, res) => {
  const { name, email, password } = req.body;
  const { accessToken, refreshToken, userId } = await createUser(
    name,
    email,
    password,
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: configs.node_env === "production",
    sameSite: configs.node_env === "production" ? "none" : "lax",
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: { userId, name, email },
      accessToken,
    },
  });
};

/**
 * @route POST /auth/login
 * @access Public
 */
export const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, userId, name } = await loginUser(
    email,
    password,
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: configs.node_env === "production",
    sameSite: configs.node_env === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: { userId, name, email },
      accessToken,
    },
  });
};

/**
 * @route POST /auth/refresh
 * @access Public
 */
export const refreshTokenController = async (req, res) => {
  const refreshTokenString = req.cookies.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } =
    await refreshToken(refreshTokenString);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: configs.node_env === "production",
    sameSite: configs.node_env === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: { accessToken },
  });
};

/**
 * @route POST /auth/logout
 * @access Public
 */
export const logoutUserController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await logoutUser(refreshToken);

  res.clearCookie("refreshToken");
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

/**
 * @route POST /auth/forgot-password
 * @access Public
 */
export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  await forgotPassword(email);
  res.status(200).json({
    success: true,
    message: `Password reset link is sent to ${email}`,
  });
};

/**
 * @route POST /auth/reset-password
 * @access Public
 */

export const resetPasswordController = async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;
  await resetPassword(token, newPassword);

  res.status(200).json({
    success: true,
    message: "Password Reset successfull, Please Login with new Password",
  });
};
