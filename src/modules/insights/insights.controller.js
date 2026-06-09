import { getDashboardData, getAnalyticsData } from "./services/index.js";

/**
 * @route GET /admin/dashboard
 * @access Private
 */
export const getDashboardController = async (req, res) => {
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
export const getAnalyticsController = async (req, res) => {
  const report = await getAnalyticsData();

  res.status(200).json({
    success: true,
    message: "Analytics data fetched successfully",
    data: report,
  });
};
