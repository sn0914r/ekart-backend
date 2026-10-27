import { UserService } from "./user.service.js";

export class UserController {
  /**
   * @route GET /users/me, /user/me
   * @access Private (User)
   */
  static async getMyProfile(req, res) {
    const { userId } = req.user;
    const profile = await UserService.getMyProfile(userId);

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: profile,
    });
  }

  /**
   * @route PATCH /users/me, /user/me
   * @access Private (User)
   */
  static async updateMyProfile(req, res) {
    const { userId } = req.user;
    const updates = req.body;
    const updatedProfile = await UserService.updateMyProfile(userId, updates);

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: updatedProfile,
    });
  }

  /**
   * @route GET /admin/users
   * @access Private (Admin, Demo Admin)
   */
  static async adminGetUsersList(req, res) {
    const { users, pagination } = await UserService.adminGetUsersList(
      req.query,
    );

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination,
    });
  }

  /**
   * @route GET /admin/users/:id
   * @access Private (Admin, Demo Admin)
   */
  static async adminGetUserOverview(req, res) {
    const { id } = req.params;
    const userDetails = await UserService.adminGetUserOverview(id);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: userDetails,
    });
  }

  /**
   * @route PATCH /admin/users/:id
   * @access Private (Admin)
   */
  static async adminUpdateUser(req, res) {
    const { id } = req.params;
    const updates = req.body;
    const currentAdminId = req.user.userId;

    const updatedUser = await UserService.adminUpdateUser(
      id,
      updates,
      currentAdminId,
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  }
}
