const express = require("express");

// MIDDLEWARES
const verifyAuth = require("../middlewares/verifyAuth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload.middleware");
const checkFile = require("../middlewares/checkFile.middleware");
const parseBody = require("../middlewares/parseBody.middleware");
// CONTROLLERS
const createProduct = require("../controllers/createProduct.controller");

// VALIDATION SCHEMAS
const createProductSchema = require("../schemas/createProduct.schema");
const getOrders = require("../controllers/getOrders.controller");
const patchOrders = require("../controllers/patchOrders");
const OrderPATCHSchema = require("../schemas/orderPATCH.schema");

const router = express.Router();

// ROUTES

router.get("/orders", verifyAuth, isAdmin, getOrders);

router.post(
  "/products",
  verifyAuth,
  isAdmin,
  upload,
  checkFile,
  parseBody,
  validate(createProductSchema),
  createProduct
);

router.patch(
  "/orders/:id",
  verifyAuth,
  isAdmin,
  validate(OrderPATCHSchema),
  patchOrders
);

module.exports = router;
