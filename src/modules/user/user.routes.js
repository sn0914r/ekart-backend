import { Router } from "express";
import { userProfileRoutes } from "./routes/user.routes.js";

export const userRouter = Router();

userRouter.use(userProfileRoutes);
