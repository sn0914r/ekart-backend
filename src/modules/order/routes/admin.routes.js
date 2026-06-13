import { Router } from "express";
import {
  authenticate,
  requireRole,
} from "../../../middlewares/auth.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import {
  getOrderForAdminController,
  getOrdersForAdminController,
  updateOrderByAdminController,
} from "../controllers/admin.controller.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import { updateShippingStatusSchema } from "../order.schema.js";

export const adminOrderRoutes = Router();

adminOrderRoutes.get(
  "/admin/orders",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  getOrdersForAdminController,
);

adminOrderRoutes.get(
  "/admin/orders/:id",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  getOrderForAdminController,
);

adminOrderRoutes.patch(
  "/admin/orders/:id",
  authenticate,
  requireRole([ROLES.ADMIN]),
  validate(updateShippingStatusSchema),
  updateOrderByAdminController,
);
