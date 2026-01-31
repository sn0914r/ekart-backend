const router = require("express").Router();

const { registerUserSchema } = require("../validation/auth.schema");
const { validateBody } = require("../middlewares/validation.middleware");
const { createUserController } = require("../controllers/auth.controller");

// Public
router.post(
  "/auth/register",
  validateBody(registerUserSchema),
  createUserController,
);

module.exports = router;
