import { Router } from "express";
import { publicProductRoutes } from "./routes/public.routes.js";
import { adminProductRoutes } from "./routes/admin.routes.js";

export const productsRouter = Router();

productsRouter.use(publicProductRoutes);
productsRouter.use(adminProductRoutes);
