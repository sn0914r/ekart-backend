const express = require("express");
const { verifyAuth, requireUser } = require("../middlewares/auth.middleware");
const {
  getOrdersForUserController,
} = require("../controllers/order.controller");

const router = express.Router();
router.get("/orders", verifyAuth, requireUser, getOrdersForUserController);

module.exports = router;
