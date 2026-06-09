import { Router } from "express";
import {
  authenticate,
  requireRole,
} from "../../../middlewares/auth.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import {
  createOrderController,
  getOrderController,
  getOrdersController,
  updateOrderStatusController,
} from "../controllers/user.controller.js";
import { validate } from "../../../middlewares/validation.middleware.js";
import { createOrderSchema, updateOrderStatusSchema } from "../order.schema.js";

export const userOrderRoutes = Router();

userOrderRoutes.get(
  "/orders",
  authenticate,
  requireRole([ROLES.USER]),
  getOrdersController,
);

userOrderRoutes.get(
  "/orders/:id",
  authenticate,
  requireRole([ROLES.USER]),
  getOrderController,
);

userOrderRoutes.post(
  "/orders",
  authenticate,
  requireRole([ROLES.USER]),
  validate(createOrderSchema),
  createOrderController,
);

userOrderRoutes.patch(
  "/orders/:id",
  authenticate,
  requireRole([ROLES.USER]),
  validate(updateOrderStatusSchema),
  updateOrderStatusController,
);
