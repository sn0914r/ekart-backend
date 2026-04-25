const configs = require("../../configs");
const Service = require("../auth/auth.service");

/**
 * @route POST /auth/register
 * @access Public
 * @desc Creates a new user and returns access and refresh tokens
 */
const createUserController = async (req, res) => {
  const { name, email, password } = req.body;
  const { accessToken, refreshToken } = await Service.createUser(
    name,
    email,
    password,
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: configs.node_env === "production",
    sameSite: configs.node_env === "production" ? "none" : "lax",
  });

  res.status(201).json({ accessToken });
};

/**
 * @route POST /auth/login
 * @access Public
 * @desc Logs in a user and returns access and refresh tokens
 */
const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken } = await Service.loginUser(
    email,
    password,
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: configs.node_env === "production",
    sameSite: configs.node_env === "production" ? "none" : "lax",
  });

  res.status(200).json({ accessToken });
};

/**
 * @route POST /auth/refresh
 * @access Public
 * @desc Refreshes the access token
 */
const refreshTokenController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = await Service.refreshToken(refreshToken);

  res.status(200).json({ accessToken });
};

/**
 * @route POST /auth/logout
 * @access Public
 * @desc Logs out a user
 */
const logoutUserController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await Service.logoutUser(refreshToken);

  res.clearCookie("refreshToken");
  res.status(200).json({ message: "User logged out successfully" });
};

module.exports = {
  createUserController,
  loginUserController,
  refreshTokenController,
  logoutUserController,
};
