import { Router } from "express";
import { authenticate, requireRole } from "#middlewares/auth.middleware.js";
import { validate } from "#middlewares/validation.middleware.js";
import { ROLES } from "#constants/index.js";
import {
  getUserByIdForAdminController,
  getUsersForAdminController,
  updateUserByAdminController,
} from "../controllers/admin.controller.js";
import {
  adminUpdateUserSchema,
  adminUserQuerySchema,
  userIdParamSchema,
} from "../user.schema.js";

export const adminUserRoutes = Router();

adminUserRoutes.get(
  "/admin/users",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  validate(adminUserQuerySchema, "query"),
  getUsersForAdminController,
);

adminUserRoutes.get(
  "/admin/users/:id",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  validate(userIdParamSchema, "params"),
  getUserByIdForAdminController,
);

adminUserRoutes.patch(
  "/admin/users/:id",
  authenticate,
  requireRole([ROLES.ADMIN]),
  validate(userIdParamSchema, "params"),
  validate(adminUpdateUserSchema, "body"),
  updateUserByAdminController,
);
