const router = require("express").Router();
const {
  getDashboardController,
  getAnalyticsController,
} = require("./insights.controller");
const {
  verifyAuth,
  requireRole,
} = require("../../middlewares/auth.middleware");
const { ROLES } = require("../../constants/roles");

router.get(
  "/admin/dashboard",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  getDashboardController,
);

router.get(
  "/admin/analytics",
  verifyAuth,
  requireRole([ROLES.ADMIN]),
  getAnalyticsController,
);

module.exports = router;
