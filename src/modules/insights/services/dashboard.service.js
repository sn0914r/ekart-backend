import OrderModel from "../../../models/Order/Order.model.js";
import ProductModel from "../../../models/Product.model.js";

export const getDashboardData = async () => {
  const [
    totalRevenueResult,
    totalOrders,
    pendingOrders,
    lowStockCount,
    recentOrders,
    lowStockItems,
    recentActivity,
  ] = await Promise.all([
    // INFO: Total Revenue
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: "PAID",
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
      orderStatus: "CREATED",
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

    // INFO: Recent Activity
    OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderStatus paymentStatus createdAt subTotal"),
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;

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
