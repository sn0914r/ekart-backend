import { Router } from "express";
import { userProfileRoutes } from "./routes/user.routes.js";
import { adminUserRoutes } from "./routes/admin.routes.js";

export const userRouter = Router();

userRouter.use(userProfileRoutes);
userRouter.use(adminUserRoutes);

