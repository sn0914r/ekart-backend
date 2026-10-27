import { Router } from "express";
import { validate } from "#middlewares/validation.middleware.js";
import { rateLimiter } from "#middlewares/rateLimiter.middleware.js";
import { RATE_LIMIT } from "#constants/rateLimiter.js";
import { AuthController } from "./auth.controller.js";
import {
  forgotPasswordSchema,
  loginUserSchema,
  refreshTokenSchema,
  registerUserSchema,
  resetPasswordSchema,
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
  AuthController.register,
);

authRouter.post(
  "/auth/login",
  rateLimiter(
    RATE_LIMIT.LOGIN.MAX,
    RATE_LIMIT.LOGIN.ROUTE,
    RATE_LIMIT.LOGIN.WINDOW_MS,
  ),
  validate(loginUserSchema, "body"),
  AuthController.login,
);

authRouter.post(
  "/auth/refresh",
  validate(refreshTokenSchema, "cookies"),
  AuthController.refresh,
);

authRouter.post("/auth/logout", AuthController.logout);

authRouter.post(
  "/auth/forgot-password",
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);

authRouter.post(
  "/auth/reset-password",
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);
