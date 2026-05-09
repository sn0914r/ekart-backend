const { getDashboardData } = require("./services/dashboard.service");
const { getAnalyticsData } = require("./services/analytics.service");

/**
 * @route GET /admin/dashboard
 * @access Private
 */
const getDashboardController = async (req, res) => {
  const report = await getDashboardData();

  res.status(200).json({
    success: true,
    message: "Dashboard data fetched successfully",
    data: report,
  });
};

/**
 * @route GET /admin/analytics
 * @access Private
 */
const getAnalyticsController = async (req, res) => {
  const report = await getAnalyticsData();

  res.status(200).json({
    success: true,
    message: "Analytics data fetched successfully",
    data: report,
  });
};

module.exports = {
  getDashboardController,
  getAnalyticsController,
};
