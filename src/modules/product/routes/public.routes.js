import { Router } from "express";
import {
  getActiveProductDetailsController,
  getActiveProductsController,
  getAvailableColorsOptionsByProductNameController,
} from "../controllers/public.controller.js";

export const publicProductRoutes = Router();

publicProductRoutes.get("/products", getActiveProductsController);

publicProductRoutes.get(
  "/products/colors",
  getAvailableColorsOptionsByProductNameController,
);

publicProductRoutes.get("/products/:id", getActiveProductDetailsController);
