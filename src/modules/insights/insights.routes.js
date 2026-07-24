import { Router } from "express";
import { authenticate, requireRole } from "#middlewares/auth.middleware.js";
import { ROLES } from "#constants/index.js";
import {
  getDashboardController,
  getAnalyticsController,
} from "./insights.controller.js";

export const insightsRouter = Router();

insightsRouter.get(
  "/admin/dashboard",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  getDashboardController,
);

insightsRouter.get(
  "/admin/analytics",
  authenticate,
  requireRole([ROLES.ADMIN, ROLES.DEMO_ADMIN]),
  getAnalyticsController,
);
