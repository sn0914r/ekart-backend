import OrderModel from "#db/models/order.model.js";
import ProductModel from "#db/models/product.model.js";
import { ORDER } from "#constants/index.js";

export class InsightsRepository {
  /**
   * @returns {Promise<number>}
   */
  static async getTotalPaidRevenue() {
    const result = await OrderModel.aggregate([
      {
        $match: {
          paymentStatus: ORDER.PAYMENT_STATUS.PAID,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$subTotal" },
        },
      },
    ]);

    return result[0]?.total || 0;
  }

  /**
   * @returns {Promise<number>}
   */
  static async getTotalOrdersCount() {
    return await OrderModel.countDocuments();
  }

  /**
   * @returns {Promise<number>}
   */
  static async getPendingOrdersCount() {
    return await OrderModel.countDocuments({
      orderStatus: ORDER.ORDER_STATUS.CREATED,
    });
  }

  /**
   * @param {number} [threshold=10]
   * @returns {Promise<number>}
   */
  static async getLowStockCount(threshold = 10) {
    return await ProductModel.countDocuments({ stock: { $lt: threshold } });
  }

  /**
   * @param {number} [limit=10]
   * @returns {Promise<Array<object>>}
   */
  static async getRecentOrders(limit = 10) {
    return await OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("email subTotal orderStatus paymentStatus createdAt")
      .lean();
  }

  /**
   * @param {number} [threshold=10]
   * @param {number} [limit=5]
   * @returns {Promise<Array<object>>}
   */
  static async getLowStockProducts(threshold = 10, limit = 5) {
    return await ProductModel.find({ stock: { $lt: threshold } })
      .select("name stock category images")
      .limit(limit)
      .lean();
  }

  /**
   * @returns {Promise<Array<object>>}
   */
  static async getMonthlyRevenueAggregation() {
    return await OrderModel.aggregate([
      {
        $match: {
          paymentStatus: ORDER.PAYMENT_STATUS.PAID,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$subTotal" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);
  }

  /**
   * @returns {Promise<Array<object>>}
   */
  static async getOrderStatusDistributionAggregation() {
    return await OrderModel.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  /**
   * @param {number} [limit=5]
   * @returns {Promise<Array<object>>}
   */
  static async getTopProductsAggregation(limit = 5) {
    return await OrderModel.aggregate([
      {
        $match: {
          paymentStatus: ORDER.PAYMENT_STATUS.PAID,
        },
      },
      {
        $unwind: "$orderSnapshot",
      },
      {
        $group: {
          _id: "$orderSnapshot.productId",
          revenue: { $sum: "$orderSnapshot.lineTotal" },
          totalSold: { $sum: "$orderSnapshot.quantity" },
          productName: { $first: "$orderSnapshot.name" },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          revenue: 1,
          totalSold: 1,
          productName: 1,
          image: { $arrayElemAt: ["$product.images", 0] },
        },
      },
    ]);
  }
}
