const router = require("express").Router();
const {
  getDashboardController,
  getAnalyticsController,
} = require("./insights.controller");
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

router.get(
  "/admin/analytics",
  verifyAuth,
  requireAdmin,
  getAnalyticsController,
);

module.exports = router;
