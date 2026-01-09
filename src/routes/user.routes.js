const express = require("express");
const getOrders = require("../controllers/getOrders.controller");
const verifyAuth = require("../middlewares/verifyAuth.middleware");
const isNotAdmin = require("../middlewares/isNotAdmin.middleware");
const router = express.Router();

router.get("/orders", verifyAuth, isNotAdmin, getOrders);

module.exports = router;
