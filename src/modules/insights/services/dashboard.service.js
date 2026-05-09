const OrderModel = require("../../../models/Order/Order.model");
const ProductModel = require("../../../models/Product.model");

const getDashboardData = async () => {
  const [
    totalRevenueResult,
    totalOrders,
    pendingOrders,
    lowStockCount,
    recentOrders,
    lowStockItems,
    recentActivity,
  ] = await Promise.all([
    // Total Revenue
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

    // Total Orders
    OrderModel.countDocuments(),

    // Pending Orders
    OrderModel.countDocuments({
      orderStatus: "CREATED",
    }),

    // Low Stock Count
    ProductModel.countDocuments({ stock: { $lt: 10 } }),

    // Recent Orders
    OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("email subTotal orderStatus paymentStatus createdAt"),

    // Low stock Items
    ProductModel.find({
      stock: { $lt: 10 },
    })
      .select("name stock category images")
      .limit(5),

    // Recent Activity
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

module.exports = { getDashboardData };
