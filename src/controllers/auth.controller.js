const { createUser } = require("../services/auth.service");

/**
 * Creates new user and returns Single signin token
 */
const createUserController = async (req, res) => {
  const { name, email, password } = req.body;
  const token = await createUser({ name, email, password });
  res.status(200).json(token);
};

module.exports = { createUserController };
