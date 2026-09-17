import UserModel from "#modules/auth/models/user.model.js";
import OrderModel from "#modules/order/OrderModel/order.model.js";
import CartModel from "#modules/cart/cart.model.js";
import WishlistModel from "#modules/wishlist/wishlist.model.js";
import { AppError } from "#errors/AppError.js";
import { ERROR_CODES } from "#constants/index.js";

/**
 * Fetches the authenticated user's profile, summary statistics, and recent orders in parallel.
 *
 * @param {string} userId
 * @returns {Promise<object>} Profile overview payload
 */
export const getMyProfile = async (userId) => {
  const [user, totalOrders, recentOrdersDocs, cart, wishlist] =
    await Promise.all([
      UserModel.findById(userId).select("-password -updatedAt"),
      OrderModel.countDocuments({ userId }),
      OrderModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "orderId subTotal orderStatus paymentStatus createdAt orderSnapshot",
        ),
      CartModel.findOne({ userId }).select("items"),
      WishlistModel.findOne({ userId }).select("items"),
    ]);

  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    createdAt: user.createdAt,
  };

  // Only expose role if the account is an admin or demo-admin
  if (user.role && user.role !== "user") {
    userData.role = user.role;
  }

  const stats = {
    totalOrders: totalOrders || 0,
    cartItemsCount: cart?.items?.length || 0,
    wishlistItemsCount: wishlist?.items?.length || 0,
  };

  const recentOrders = recentOrdersDocs.map((order) => ({
    id: order._id,
    _id: order._id,
    orderId: order.orderId,
    subTotal: order.subTotal,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    itemsCount: order.orderSnapshot?.length || 0,
    createdAt: order.createdAt,
  }));

  return {
    user: userData,
    stats,
    recentOrders,
  };
};
