import UserModel from "#modules/auth/models/user.model.js";
import OrderModel from "#modules/order/order.model.js";
import CartModel from "#modules/cart/cart.model.js";
import WishlistModel from "#modules/wishlist/wishlist.model.js";
import { AppError } from "#errors/AppError.js";
import { ERROR_CODES, ORDER } from "#constants/index.js";

/**
 * Fetches comprehensive 360 overview for a given user for admin inspection
 *
 * @param {string} userId
 * @returns {Promise<object>} Complete user profile, order statistics, and recent activity
 */
export const getUserByIdForAdmin = async (userId) => {
  const user = await UserModel.findById(userId).select("-password").lean();

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const [totalOrders, spendResult, recentOrdersDocs, cart, wishlist] =
    await Promise.all([
      OrderModel.countDocuments({ userId }),
      OrderModel.aggregate([
        {
          $match: {
            userId: userId.toString(),
            paymentStatus: ORDER.PAYMENT_STATUS.PAID,
          },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$subTotal" },
          },
        },
      ]),
      OrderModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "orderId subTotal orderStatus paymentStatus shippingStatus createdAt orderSnapshot",
        )
        .lean(),
      CartModel.findOne({ userId }).select("items").lean(),
      WishlistModel.findOne({ userId }).select("items").lean(),
    ]);

  const totalSpent = spendResult.length > 0 ? spendResult[0].totalSpent : 0;

  const recentOrders = recentOrdersDocs.map((order) => ({
    id: order._id,
    orderId: order.orderId,
    subTotal: order.subTotal,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    shippingStatus: order.shippingStatus,
    itemsCount: order.orderSnapshot?.length || 0,
    createdAt: order.createdAt,
  }));

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      isActive: user.isActive !== false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    stats: {
      totalOrders: totalOrders || 0,
      totalSpent,
      cartItemsCount: cart?.items?.length || 0,
      wishlistItemsCount: wishlist?.items?.length || 0,
    },
    recentOrders,
  };
};
