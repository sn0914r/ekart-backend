const router = require("express").Router();
const { getDashboardController } = require("./insights.controller");
const {
  verifyAuth,
  requireAdmin,
} = require("../../middlewares/auth.middleware");

router.get(
  "/admin/dashboard",
  verifyAuth,
  requireAdmin,
  getDashboardController,
);

module.exports = router;
