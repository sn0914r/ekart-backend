import { Router } from "express";
import { authenticate, requireRole } from "#middlewares/auth.middleware.js";
import { validate } from "#middlewares/validation.middleware.js";
import { ROLES } from "#constants/index.js";
import { UserController } from "./user.controller.js";
import {
  adminUpdateUserSchema,
  adminUserQuerySchema,
  updateProfileSchema,
  userIdParamSchema,
} from "./user.schema.js";

export const userRouter = Router();

// INFO: Customer Profile Routes
userRouter.get(
  ["/users/me", "/user/me"],
  authenticate,
  UserController.getMyProfile,
);

userRouter.patch(
  ["/users/me", "/user/me"],
  authenticate,
  validate(updateProfileSchema),
  UserController.updateMyProfile,
);

// INFO: Admin User Management Routes
userRouter.get(
  "/admin/users",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  validate(adminUserQuerySchema, "query"),
  UserController.adminGetUsersList,
);

userRouter.get(
  "/admin/users/:id",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  validate(userIdParamSchema, "params"),
  UserController.adminGetUserOverview,
);

userRouter.patch(
  "/admin/users/:id",
  authenticate,
  requireRole([ROLES.ADMIN]),
  validate(userIdParamSchema, "params"),
  validate(adminUpdateUserSchema, "body"),
  UserController.adminUpdateUser,
);
