const { getOrdersController, createOrderController, updateOrderController } = require("../controllers/order.controller");
const { verifyAuth, requireUser, requireAdmin } = require("../middlewares/auth.middleware");

const router = require("express").Router();


// User
router.get("/orders", verifyAuth, requireUser, getOrdersController);
router.post("/orders", verifyAuth, requireUser, createOrderController); 

// Admin
router.get("/admin/orders", verifyAuth, requireAdmin, getOrdersController);
router.patch("/admin/orders/:id", verifyAuth, requireAdmin, updateOrderController)

module.exports = router;
