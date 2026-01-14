const express = require("express");

const { getProductsController } = require("../controllers/product.controller");
const { createUserController } = require("../controllers/auth.controller");

const { validateBody } = require("../middlewares/validation.middleware");
const { registerUserSchema } = require("../validation/auth.schema");

const router = express.Router();
router.get("/products", getProductsController);

router.post(
  "/auth/register",
  validateBody(registerUserSchema),
  createUserController
);

module.exports = router;
