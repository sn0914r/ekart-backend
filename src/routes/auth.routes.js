const router = require("express").Router();

const { registerUserSchema } = require("../validation/auth.schema");
const { validate } = require("../middlewares/validation.middleware");
const { createUserController } = require("../controllers/auth.controller");

// Public
router.post(
  "/auth/register",
  validate(registerUserSchema, "body"),
  createUserController,
);

module.exports = router;
