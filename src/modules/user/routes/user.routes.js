import { Router } from "express";
import { authenticate } from "#middlewares/auth.middleware.js";
import { validate } from "#middlewares/validation.middleware.js";
import {
  getMyProfileController,
  updateMyProfileController,
} from "../controllers/user.controller.js";
import { updateProfileSchema } from "../user.schema.js";

export const userProfileRoutes = Router();

userProfileRoutes.get(
  ["/users/me", "/user/me"],
  authenticate,
  getMyProfileController,
);

userProfileRoutes.patch(
  ["/users/me", "/user/me"],
  authenticate,
  validate(updateProfileSchema),
  updateMyProfileController,
);
