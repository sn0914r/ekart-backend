const authService = require("../services/auth.service");

/**
 * @desc Creates a new user in Firebase
 *
 * Preconditions:
 *  - req.body contains valid name, email, and password
 *
 * @route POST /auth/register
 * @access Public
 */
const createUserController = async (req, res) => {
  const { name, email, password } = req.body;
  const token = await authService.createUser({ name, email, password });
  res.status(201).json(token);
};

module.exports = { createUserController };
