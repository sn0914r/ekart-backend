import UserModel from "#modules/auth/models/user.model.js";
import RefreshTokenModel from "#modules/auth/models/refreshTokens.model.js";
import { AppError } from "#errors/AppError.js";
import { ERROR_CODES, ROLES } from "#constants/index.js";

/**
 * Updates a user's role or active status by admin with guardrails
 *
 * @param {string} targetUserId - Target user ID to update
 * @param {{ role?: string, isActive?: boolean }} updates - Update payload
 * @param {string} currentAdminId - ID of the authenticated admin making the request
 * @returns {Promise<object>} Updated user data
 */
export const updateUserByAdmin = async (
  targetUserId,
  updates,
  currentAdminId,
) => {
  const targetUser = await UserModel.findById(targetUserId);

  if (!targetUser || targetUser.isDeleted) {
    throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const isSelf = targetUserId.toString() === currentAdminId.toString();

  // Self-action guards
  if (isSelf) {
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

  const updateFields = {};
  if (updates.role !== undefined) updateFields.role = updates.role;
  if (updates.isActive !== undefined) updateFields.isActive = updates.isActive;

  const updatedUser = await UserModel.findByIdAndUpdate(
    targetUserId,
    updateFields,
    { new: true, runValidators: true },
  )
    .select("-password")
    .lean();

  // If deactivated or role changed, purge all active refresh tokens for immediate revocation
  const isDeactivated = updates.isActive === false;
  const isRoleChanged = updates.role && updates.role !== targetUser.role;

  if (isDeactivated || isRoleChanged) {
    await RefreshTokenModel.deleteMany({ userId: targetUserId });
  }

  return updatedUser;
};
