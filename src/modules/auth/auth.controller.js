import { configs } from "#configs/index.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
  /**
   * @route POST /auth/register
   * @access Public
   */
  static async register(req, res) {
    const { name, email, password } = req.body;
    const { accessToken, refreshToken, userId } =
      await AuthService.registerUser(name, email, password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: configs.node_env === "production",
      sameSite: configs.node_env === "production" ? "none" : "lax",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: { userId, name, email },
        accessToken,
      },
    });
  }

  /**
   * @route POST /auth/login
   * @access Public
   */
  static async login(req, res) {
    const { email, password } = req.body;
    const { accessToken, refreshToken, userId, name } =
      await AuthService.loginUser(email, password);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: configs.node_env === "production",
      sameSite: configs.node_env === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: { userId, name, email },
        accessToken,
      },
    });
  }

  /**
   * @route POST /auth/refresh
   * @access Public
   */
  static async refresh(req, res) {
    const refreshTokenString = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } =
      await AuthService.refreshAccessToken(refreshTokenString);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: configs.node_env === "production",
      sameSite: configs.node_env === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  }

  /**
   * @route POST /auth/logout
   * @access Public
   */
  static async logout(req, res) {
    const refreshToken = req.cookies.refreshToken;
    await AuthService.logoutUser(refreshToken);

    res.clearCookie("refreshToken");
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  }

  /**
   * @route POST /auth/forgot-password
   * @access Public
   */
  static async forgotPassword(req, res) {
    const { email } = req.body;
    await AuthService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: `Password reset link is sent to ${email}`,
    });
  }

  /**
   * @route POST /auth/reset-password
   * @access Public
   */
  static async resetPassword(req, res) {
    const { token } = req.query;
    const { newPassword } = req.body;
    await AuthService.resetPassword(token, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password Reset successfull, Please Login with new Password",
    });
  }
}
