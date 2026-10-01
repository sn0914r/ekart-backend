import OrderModel from "#modules/order/order.model.js";
import ProductModel from "#modules/product/product.model.js";
import { ORDER } from "#constants/index.js";

export const getDashboardData = async () => {
  const [
    totalRevenueResult,
    totalOrders,
    pendingOrders,
    lowStockCount,
    recentOrders,
    lowStockItems,
  ] = await Promise.all([
    // INFO: Total Revenue
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: ORDER.PAYMENT_STATUS.PAID,
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$subTotal",
          },
        },
      },
    ]),

    // INFO: Total Orders
    OrderModel.countDocuments(),

    // INFO: Pending Orders
    OrderModel.countDocuments({
      orderStatus: ORDER.ORDER_STATUS.CREATED,
    }),

    // INFO: Low Stock Count
    ProductModel.countDocuments({ stock: { $lt: 10 } }),

    // INFO: Recent Orders
    OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("email subTotal orderStatus paymentStatus createdAt"),

    // INFO: Low stock Items
    ProductModel.find({
      stock: { $lt: 10 },
    })
      .select("name stock category images")
      .limit(5),
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;

  // INFO: Derive recent activity from recent orders (first 5) without an extra DB round-trip
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
};
