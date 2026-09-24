import {
  getUserByIdForAdmin,
  getUsersForAdmin,
  updateUserByAdmin,
} from "../services/index.js";

/**
 * @route GET /admin/users
 * @access Private (Admin, Demo Admin)
 */
export const getUsersForAdminController = async (req, res) => {
  const query = req.query;

  const { users, pagination } = await getUsersForAdmin(query);

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: users,
    pagination,
  });
};

/**
 * @route GET /admin/users/:id
 * @access Private (Admin, Demo Admin)
 */
export const getUserByIdForAdminController = async (req, res) => {
  const { id } = req.params;

  const userDetails = await getUserByIdForAdmin(id);

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: userDetails,
  });
};

/**
 * @route PATCH /admin/users/:id
 * @access Private (Admin)
 */
export const updateUserByAdminController = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const currentAdminId = req.user.userId;

  const updatedUser = await updateUserByAdmin(id, updates, currentAdminId);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
};
