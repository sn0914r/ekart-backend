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

const router = express.Router();

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

module.exports = router;
