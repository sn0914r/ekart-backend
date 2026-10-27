import { InsightsRepository } from "./insights.repository.js";

export class InsightsService {
  /**
   * @returns {Promise<object>}
   */
  static async adminGetDashboardOverview() {
    const [
      totalRevenue,
      totalOrders,
      pendingOrders,
      lowStockCount,
      recentOrders,
      lowStockItems,
    ] = await Promise.all([
      InsightsRepository.getTotalPaidRevenue(),
      InsightsRepository.getTotalOrdersCount(),
      InsightsRepository.getPendingOrdersCount(),
      InsightsRepository.getLowStockCount(10),
      InsightsRepository.getRecentOrders(10),
      InsightsRepository.getLowStockProducts(10, 5),
    ]);

    // INFO: Deriving recent activity from recent orders (first 5) without extra DB round-trip
    const recentActivity = recentOrders.slice(0, 5).map((order) => ({
      _id: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      subTotal: order.subTotal,
    }));

    return {
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        lowStockCount,
      },
      recentOrders,
      lowStockItems,
      recentActivity,
    };
  }

  /**
   * @returns {Promise<object>}
   */
  static async adminGetAnalyticsReport() {
    const [monthlyRevenue, orderStatusDistribution, topProducts] =
      await Promise.all([
        InsightsRepository.getMonthlyRevenueAggregation(),
        InsightsRepository.getOrderStatusDistributionAggregation(),
        InsightsRepository.getTopProductsAggregation(),
      ]);

    const totalRevenue = monthlyRevenue.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    const totalPaidOrders = monthlyRevenue.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    const averageOrderValue =
      totalPaidOrders > 0 ? totalRevenue / totalPaidOrders : 0;

    return {
      monthlyRevenue,
      orderStatusDistribution,
      topProducts,
      metrics: {
        totalRevenue,
        totalPaidOrders,
        averageOrderValue,
      },
    };
  }
}
