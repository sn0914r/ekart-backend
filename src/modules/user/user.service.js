import { AppError } from "#errors/AppError.js";
import { ERROR_CODES, ROLES } from "#constants/index.js";
import { UserRepository } from "./user.repository.js";
import { CartRepository } from "#modules/cart/cart.repository.js";
import { WishlistRepository } from "#modules/wishlist/wishlist.repository.js";

export class UserService {
  /**
   * Formats the user profile payload, attaching roles only for non-standard user accounts
   * @param {object} user
   * @returns {object}
   */
  static #formatUserProfile(user) {
    const data = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      createdAt: user.createdAt,
    };

    if (user.role && user.role !== "user") {
      data.role = user.role;
    }

    return data;
  }

  /**
   * Formats a list of recent order documents
   * @param {Array<object>} orders
   * @param {{includeShipping?: boolean}} options
   * @returns {Array<object>}
   */
  static #formatRecentOrders(orders = [], { includeShipping = false } = {}) {
    return orders.map((order) => {
      const formatted = {
        id: order._id,
        _id: order._id,
        orderId: order.orderId,
        subTotal: order.subTotal,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        itemsCount: order.orderSnapshot?.length || 0,
        createdAt: order.createdAt,
      };

      if (includeShipping && order.shippingStatus) {
        formatted.shippingStatus = order.shippingStatus;
      }

      return formatted;
    });
  }

  /**
   * Validates admin self-modification restrictions
   * @param {boolean} isSelf
   * @param {{role?: string, isActive?: boolean}} updates
   */
  static #validateSelfActionGuards(isSelf, updates) {
    if (!isSelf) return;

    if (updates.isActive === false) {
      throw new AppError(
        "You cannot deactivate your own admin account",
        400,
        ERROR_CODES.BAD_REQUEST_ERROR,
      );
    }

    if (updates.role && updates.role !== ROLES.ADMIN) {
      throw new AppError(
        "You cannot change or demote your own admin role",
        400,
        ERROR_CODES.BAD_REQUEST_ERROR,
      );
    }
  }

  /**
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async getMyProfile(userId) {
    const [user, totalOrders, recentOrdersDocs, cart, wishlist] =
      await Promise.all([
        UserRepository.findUserById(userId, "-password -updatedAt"),
        UserRepository.countOrdersByUserId(userId),
        UserRepository.findRecentOrdersByUserId(userId, 5),
        CartRepository.findCartByUserId(userId),
        WishlistRepository.findWishlistByUserId(userId),
      ]);

    if (!user || user.isDeleted) {
      throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    return {
      user: UserService.#formatUserProfile(user),
      stats: {
        totalOrders: totalOrders || 0,
        cartItemsCount: cart?.items?.length || 0,
        wishlistItemsCount: wishlist?.items?.length || 0,
      },
      recentOrders: UserService.#formatRecentOrders(recentOrdersDocs),
    };
  }

  /**
   * @param {string} userId
   * @param {{name?: string, phone?: string}} [updates={}]
   * @returns {Promise<object>}
   */
  static async updateMyProfile(userId, updates = {}) {
    const allowedUpdates = {};

    if (updates.name !== undefined) {
      allowedUpdates.name = updates.name.trim();
    }

    if (updates.phone !== undefined) {
      allowedUpdates.phone = updates.phone.trim();
    }

    const updatedUser = await UserRepository.updateUserProfileById(
      userId,
      allowedUpdates,
    );

    if (!updatedUser) {
      throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    return UserService.#formatUserProfile(updatedUser);
  }

  /**
   * @param {object} query
   * @returns {Promise<{users: Array<object>, pagination: object}>}
   */
  static async adminGetUsersList(query) {
    const { users, total, page, limit } =
      await UserRepository.findPaginatedUsers(query);

    const formattedUsers = users.map((user) => ({
      ...user,
      id: user._id,
      isActive: user.isActive !== undefined ? user.isActive : true,
      isDeleted: user.isDeleted !== undefined ? user.isDeleted : false,
      deletedAt: user.deletedAt !== undefined ? user.deletedAt : null,
    }));

    return {
      users: formattedUsers,
      pagination: {
        limit,
        page,
        totalUsers: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async adminGetUserOverview(userId) {
    const user = await UserRepository.findUserById(userId, "-password");

    if (!user || user.isDeleted) {
      throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    const [totalOrders, totalSpent, recentOrdersDocs, cart, wishlist] =
      await Promise.all([
        UserRepository.countOrdersByUserId(userId),
        UserRepository.calculateTotalSpentByUserId(userId),
        UserRepository.findRecentOrdersByUserId(userId, 5),
        CartRepository.findCartByUserId(userId),
        WishlistRepository.findWishlistByUserId(userId),
      ]);

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
      recentOrders: UserService.#formatRecentOrders(recentOrdersDocs, {
        includeShipping: true,
      }),
    };
  }

  /**
   * @param {string} targetUserId
   * @param {{role?: string, isActive?: boolean}} updates
   * @param {string} currentAdminId
   * @returns {Promise<object>}
   */
  static async adminUpdateUser(targetUserId, updates, currentAdminId) {
    const targetUser = await UserRepository.findUserById(
      targetUserId,
      "-password",
    );

    if (!targetUser || targetUser.isDeleted) {
      throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
    }

    const isSelf = targetUserId.toString() === currentAdminId.toString();
    UserService.#validateSelfActionGuards(isSelf, updates);

    const updateFields = {};
    if (updates.role !== undefined) updateFields.role = updates.role;
    if (updates.isActive !== undefined)
      updateFields.isActive = updates.isActive;

    const updatedUser = await UserRepository.updateUserStatusAndRoleById(
      targetUserId,
      updateFields,
    );

    const isDeactivated = updates.isActive === false;
    const isRoleChanged = updates.role && updates.role !== targetUser.role;

    if (isDeactivated || isRoleChanged) {
      await UserRepository.revokeAllSessionsByUserId(targetUserId);
    }

    return updatedUser;
  }
}
