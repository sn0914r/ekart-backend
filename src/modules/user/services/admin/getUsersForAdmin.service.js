import UserModel from "#modules/auth/models/user.model.js";
import {
  buildUserFilter,
  buildUserPagination,
  buildUserSort,
} from "../../helpers/user.query.js";

/**
 * Fetches paginated users for admin with search, filter, and sorting
 *
 * @param {object} query
 * @returns {Promise<{
 *   users: object[],
 *   pagination: {
 *     limit: number,
 *     page: number,
 *     totalPages: number,
 *     totalUsers: number
 *   }
 * }>}
 */
export const getUsersForAdmin = async (query) => {
  const filter = buildUserFilter(query);
  const sortOrder = buildUserSort(query);
  const { skip, limit, page } = buildUserPagination(query);

  const [users, totalDocs] = await Promise.all([
    UserModel.find(filter)
      .select("-password")
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  const formattedUsers = users.map((user) => ({
    ...user,
    isActive: user.isActive !== undefined ? user.isActive : true,
    isDeleted: user.isDeleted !== undefined ? user.isDeleted : false,
    deletedAt: user.deletedAt !== undefined ? user.deletedAt : null,
  }));

  return {
    users: formattedUsers,
    pagination: {
      limit,
      page,
      totalUsers: totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
    },
  };
};
