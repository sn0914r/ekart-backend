import { Router } from "express";
import { validate } from "#middlewares/validation.middleware.js";
import { rateLimiter } from "#middlewares/rateLimiter.middleware.js";
import { RATE_LIMIT } from "#constants/rateLimiter.js";
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
  rateLimiter(
    RATE_LIMIT.REGISTER.MAX,
    RATE_LIMIT.REGISTER.ROUTE,
    RATE_LIMIT.REGISTER.WINDOW_MS,
  ),
  validate(registerUserSchema, "body"),
  createUserController,
);

authRouter.post(
  "/auth/login",
  rateLimiter(
    RATE_LIMIT.LOGIN.MAX,
    RATE_LIMIT.LOGIN.ROUTE,
    RATE_LIMIT.LOGIN.WINDOW_MS,
  ),
  validate(loginUserSchema, "body"),
  loginUserController,
);

authRouter.post(
  "/auth/refresh",
  validate(refreshTokenSchema, "cookies"),
  refreshTokenController,
);

authRouter.post("/auth/logout", logoutUserController);
