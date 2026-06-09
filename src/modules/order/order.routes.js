import { userOrderRoutes } from "./routes/user.routes.js";
import { adminOrderRoutes } from "./routes/admin.routes.js";
import { Router } from "express";

export const orderRouter = Router();

orderRouter.use(userOrderRoutes);
orderRouter.use(adminOrderRoutes);
