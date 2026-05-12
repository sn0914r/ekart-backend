const Service = require("./services");

/**
 * @route GET /admin/dashboard
 * @access Private
 */
const getDashboardController = async (req, res) => {
  const report = await Service.getDashboardData();

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
  const report = await Service.getAnalyticsData();

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
