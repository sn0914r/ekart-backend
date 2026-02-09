const router = require("express").Router();

const { addProductSchema, updateProductSchema } = require("../validation/product.schema");
const { verifyAuth, requireAdmin } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { validateFile, validateBody } = require("../middlewares/validation.middleware");
const parseMultipartJson = require("../middlewares/parseMultipartJson.middleware");
const { getProductsController, addProductController, updateProductController, deleteProductController, getProductController } = require("../controllers/product.controller");

// Public
router.get("/products", getProductsController);

// Admin
router.get("/admin/products", verifyAuth, requireAdmin, getProductsController);
router.post("/admin/products", verifyAuth, requireAdmin, upload, validateFile, parseMultipartJson, validateBody(addProductSchema), addProductController);
router.patch("/admin/products/:id", verifyAuth, requireAdmin, validateBody(updateProductSchema), updateProductController);
router.delete("/admin/products/:id", verifyAuth, requireAdmin, deleteProductController);
router.get("/admin/products/:id", verifyAuth, requireAdmin, getProductController)

module.exports = router;
