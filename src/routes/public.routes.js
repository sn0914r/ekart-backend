const express = require("express");
const { getProductsController } = require("../controllers/product.controller");

const router = express.Router();
router.get("/products", getProductsController);

module.exports = router;
