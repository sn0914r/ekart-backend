import UserModel from "#modules/auth/models/user.model.js";
import { AppError } from "#errors/AppError.js";
import { ERROR_CODES } from "#constants/index.js";

/**
 * Updates allowed profile fields (name, phone) for the authenticated user.
 *
 * @param {string} userId
 * @param {{name?: string, phone?: string}} updates
 * @returns {Promise<object>} Updated user profile
 */
export const updateMyProfile = async (userId, updates = {}) => {
  const allowedUpdates = {};

  if (updates.name !== undefined) {
    allowedUpdates.name = updates.name.trim();
  }

  if (updates.phone !== undefined) {
    allowedUpdates.phone = updates.phone.trim();
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { $set: allowedUpdates },
    { new: true, runValidators: true },
  ).select("-password -updatedAt");

  if (!updatedUser) {
    throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const userData = {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone || null,
    createdAt: updatedUser.createdAt,
  };

  if (updatedUser.role && updatedUser.role !== "user") {
    userData.role = updatedUser.role;
  }

  return userData;
};
