const express = require("express");
const { verifyAuth, requireUser } = require("../middlewares/auth.middleware");
const {
  getOrdersForUserController,
  createOrderController,
} = require("../controllers/order.controller");

const router = express.Router();
router.get("/orders", verifyAuth, requireUser, getOrdersForUserController);
router.post("/orders", verifyAuth, createOrderController);
module.exports = router;
