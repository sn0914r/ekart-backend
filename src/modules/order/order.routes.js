import { Router } from "express";
import { authenticate, requireRole } from "#middlewares/auth.middleware.js";
import { validate } from "#middlewares/validation.middleware.js";
import { ROLES } from "#constants/index.js";
import { OrderController } from "./order.controller.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updateShippingStatusSchema,
  orderIdParamSchema,
} from "./order.schema.js";

export const orderRouter = Router();

// User Order Routes
orderRouter.get(
  "/orders",
  authenticate,
  requireRole([ROLES.USER]),
  OrderController.getUserOrders,
);

orderRouter.post(
  "/orders",
  authenticate,
  requireRole([ROLES.USER]),
  validate(createOrderSchema),
  OrderController.createOrder,
);

orderRouter.get(
  "/orders/:id/refunds",
  authenticate,
  requireRole([ROLES.USER, ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  validate(orderIdParamSchema, "params"),
  OrderController.getOrderRefunds,
);

orderRouter.get(
  "/orders/:id",
  authenticate,
  requireRole([ROLES.USER]),
  validate(orderIdParamSchema, "params"),
  OrderController.getUserOrderById,
);

orderRouter.patch(
  "/orders/:id",
  authenticate,
  requireRole([ROLES.USER]),
  validate(orderIdParamSchema, "params"),
  validate(updateOrderStatusSchema),
  OrderController.cancelOrder,
);

// Admin Order Routes
orderRouter.get(
  "/admin/orders",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  OrderController.adminGetOrders,
);

orderRouter.get(
  "/admin/orders/:id",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  validate(orderIdParamSchema, "params"),
  OrderController.adminGetOrderById,
);

orderRouter.patch(
  "/admin/orders/:id",
  authenticate,
  requireRole([ROLES.ADMIN]),
  validate(orderIdParamSchema, "params"),
  validate(updateShippingStatusSchema),
  OrderController.adminUpdateShippingStatus,
);
