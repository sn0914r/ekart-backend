const {
  monthlyRevenueAggregation,
} = require("./analytics-aggregations/monthlyRevenue");
const {
  orderStatusDistributionAggregation,
} = require("./analytics-aggregations/orderStatusDistribution");
const {
  topProductsAggregation,
} = require("./analytics-aggregations/topProducts");

const getAnalyticsData = async () => {
  const [monthlyRevenue, orderStatusDistribution, topProducts] =
    await Promise.all([
      monthlyRevenueAggregation,
      orderStatusDistributionAggregation,
      topProductsAggregation,
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
};

module.exports = { getAnalyticsData };
