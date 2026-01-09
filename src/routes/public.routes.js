const express = require("express");
const getProducts = require("../controllers/getProducts.controller");
const router = express.Router();

router.get("/products", getProducts);
module.exports = router;
