import { Router } from "express";
import { validate } from "../../middlewares/validation.middleware.js";

import {
  createUserController,
  loginUserController,
  logoutUserController,
  refreshTokenController,
} from "./auth.controller.js";

import {
  loginUserSchema,
  refreshTokenSchema,
  registerUserSchema,
} from "./auth.schema.js";

export const authRouter = Router();

authRouter.post(
  "/auth/register",
  validate(registerUserSchema, "body"),
  createUserController,
);

authRouter.post(
  "/auth/login",
  validate(loginUserSchema, "body"),
  loginUserController,
);

authRouter.post(
  "/auth/refresh",
  validate(refreshTokenSchema, "cookies"),
  refreshTokenController,
);

authRouter.post("/auth/logout", logoutUserController);
