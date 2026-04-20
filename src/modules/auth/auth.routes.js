const router = require("express").Router();
const { registerUserSchema } = require("./auth.schema");
const { validate } = require("../../middlewares/validation.middleware");
const { createUserController } = require("./auth.controller");

// Public routes
router.post(
  "/auth/register",
  validate(registerUserSchema, "body"),
  createUserController,
);

module.exports = router;
