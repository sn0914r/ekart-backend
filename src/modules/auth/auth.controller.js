const { createUser } = require("./auth.service");

/**
 * @route POST /auth/register
 * @access Public
 * @desc Creates a new user in Firebase and returns a single signin token
 */
const createUserController = async (req, res) => {
  const { name, email, password } = req.body;
  const token = await createUser({ name, email, password });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: token,
  });
};

module.exports = { createUserController };
