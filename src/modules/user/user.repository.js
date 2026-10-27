import UserModel from "#db/models/user.model.js";
import RefreshTokenModel from "#db/models/refreshTokens.model.js";
import OrderModel from "#db/models/order.model.js";
import { ORDER, ROLES, USER } from "#constants/index.js";

const { VALID_SORT_FIELDS } = USER;

export class UserRepository {
  /**
   * Builds filter query for users
   * @param {object} query
   * @returns {object}
   */
  static #buildFilter(query = {}) {
    const { search = null, role = null, isActive = null } = query;

    const filters = {
      isDeleted: { $ne: true },
    };

    if (search && search.trim()) {
      const trimmed = search.trim();
      filters.$or = [
        { name: { $regex: trimmed, $options: "i" } },
        { email: { $regex: trimmed, $options: "i" } },
        { phone: { $regex: trimmed, $options: "i" } },
      ];
    }

    if (role && Object.values(ROLES).includes(role)) {
      filters.role = role;
    }

    if (isActive !== null && isActive !== undefined) {
      if (isActive === "true" || isActive === true) {
        filters.isActive = true;
      } else if (isActive === "false" || isActive === false) {
        filters.isActive = false;
      }
    }

    return filters;
  }

  /**
   * Builds sort options for users
   * @param {object} query
   * @returns {Record<string, 1 | -1>}
   */
  static #buildSort(query = {}) {
    const { sort = null } = query;
    const sortOptions = {};

    if (!sort) {
      sortOptions.createdAt = -1;
      return sortOptions;
    }

    const sortedFields = sort.split(",");
    const filteredSortFields = sortedFields.filter((field) =>
      VALID_SORT_FIELDS.includes(field.trim()),
    );

    filteredSortFields.forEach((field) => {
      const cleanField = field.trim();
      const isDesc = cleanField.startsWith("-") ? -1 : 1;
      const propName = isDesc === -1 ? cleanField.slice(1) : cleanField;

      sortOptions[propName] = isDesc;
    });

    if (!sortOptions.createdAt) {
      sortOptions.createdAt = -1;
    }

    return sortOptions;
  }

  /**
   * Normalizes pagination parameters
   * @param {object} query
   * @returns {{page: number, limit: number, skip: number}}
   */
  static #buildPagination(query = {}) {
    let { page = 1, limit = 10 } = query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    limit = Math.min(limit, 50);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * @param {string} userId
   * @param {string} [selectFields="-password -updatedAt"]
   * @returns {Promise<object|null>}
   */
  static async findUserById(userId, selectFields = "-password -updatedAt") {
    return await UserModel.findById(userId).select(selectFields).lean();
  }

  /**
   * @param {string} userId
   * @param {object} updates
   * @returns {Promise<object|null>}
   */
  static async updateUserProfileById(userId, updates) {
    return await UserModel.findOneAndUpdate(
      { _id: userId, isDeleted: { $ne: true } },
      { $set: updates },
      { returnDocument: "after", runValidators: true },
    )
      .select("-password -updatedAt")
      .lean();
  }

  /**
   * Finds paginated users and total count based on raw query
   * @param {object} [query={}]
   * @returns {Promise<{users: Array<object>, total: number, page: number, limit: number}>}
   */
  static async findPaginatedUsers(query = {}) {
    const filter = UserRepository.#buildFilter(query);
    const sortOrder = UserRepository.#buildSort(query);
    const { skip, limit, page } = UserRepository.#buildPagination(query);

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select("-password")
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    return { users, total, page, limit };
  }

  /**
   * @param {object} [filter={}]
   * @returns {Promise<number>}
   */
  static async countUsers(filter = {}) {
    return await UserModel.countDocuments(filter);
  }

  /**
   * @param {string} userId
   * @param {object} updateFields
   * @returns {Promise<object|null>}
   */
  static async updateUserStatusAndRoleById(userId, updateFields) {
    return await UserModel.findByIdAndUpdate(userId, updateFields, {
      returnDocument: "after",
      runValidators: true,
    })
      .select("-password")
      .lean();
  }

  /**
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async revokeAllSessionsByUserId(userId) {
    return await RefreshTokenModel.deleteMany({ userId }).lean();
  }

  /**
   * @param {string} userId
   * @returns {Promise<number>}
   */
  static async countOrdersByUserId(userId) {
    return await OrderModel.countDocuments({ userId });
  }

  /**
   * @param {string} userId
   * @param {number} [limit=5]
   * @returns {Promise<Array<object>>}
   */
  static async findRecentOrdersByUserId(userId, limit = 5) {
    return await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "orderId subTotal orderStatus paymentStatus shippingStatus createdAt orderSnapshot",
      )
      .lean();
  }

  /**
   * @param {string} userId
   * @returns {Promise<number>}
   */
  static async calculateTotalSpentByUserId(userId) {
    const result = await OrderModel.aggregate([
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
    ]);

    return result[0]?.totalSpent || 0;
  }
}
