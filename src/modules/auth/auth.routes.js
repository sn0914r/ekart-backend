const router = require("express").Router();
const Schema = require("./auth.schema");
const { validate } = require("../../middlewares/validation.middleware");
const C = require("./auth.controller");

// Public routes
router.post(
  "/auth/register",
  validate(Schema.registerUserSchema, "body"),
  C.createUserController,
);
router.post(
  "/auth/login",
  validate(Schema.loginUserSchema, "body"),
  C.loginUserController,
);
router.post(
  "/auth/refresh",
  validate(Schema.refreshTokenSchema, "cookies"),
  C.refreshTokenController,
);
router.post("/auth/logout", C.logoutUserController);

module.exports = router;
