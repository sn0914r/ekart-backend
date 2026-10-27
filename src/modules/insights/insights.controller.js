import { InsightsService } from "./insights.service.js";

export class InsightsController {
  /**
   * @route GET /admin/dashboard
   * @access Private (Admin)
   */
  static async adminGetDashboard(req, res) {
    const report = await InsightsService.adminGetDashboardOverview();

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: report,
    });
  }

  /**
   * @route GET /admin/analytics
   * @access Private (Admin)
   */
  static async adminGetAnalytics(req, res) {
    const report = await InsightsService.adminGetAnalyticsReport();

    return res.status(200).json({
      success: true,
      message: "Analytics data fetched successfully",
      data: report,
    });
  }
}
