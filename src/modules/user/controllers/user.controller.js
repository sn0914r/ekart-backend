import { getMyProfile, updateMyProfile } from "../services/index.js";

/**
 * @route GET /users/me
 * @access Private
 */
export const getMyProfileController = async (req, res) => {
  const userId = req.user.userId;

  const profile = await getMyProfile(userId);

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: profile,
  });
};

/**
 * @route PATCH /users/me
 * @access Private
 */
export const updateMyProfileController = async (req, res) => {
  const userId = req.user.userId;
  const updates = req.body;

  const updatedProfile = await updateMyProfile(userId, updates);

  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: updatedProfile,
  });
};
