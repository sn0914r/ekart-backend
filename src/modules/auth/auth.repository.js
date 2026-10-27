import UserModel from "#db/models/user.model.js";
import RefreshTokenModel from "#db/models/refreshTokens.model.js";

export class AuthRepository {
  /**
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  static async findUserByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  }

  /**
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  static async findUserById(userId) {
    return await UserModel.findById(userId).lean();
  }

  /**
   * @param {object} userData
   * @returns {Promise<object>}
   */
  static async createNewUser(userData) {
    const user = await UserModel.create(userData);
    return user.toObject();
  }

  /**
   * @param {string} userId
   * @param {string} hashedPassword
   * @returns {Promise<object|null>}
   */
  static async updateUserPasswordById(userId, hashedPassword) {
    return await UserModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { returnDocument: "after" },
    ).lean();
  }

  /**
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async createRefreshTokenSession(userId) {
    const session = await RefreshTokenModel.create({ userId });
    return session.toObject();
  }

  /**
   * @param {string} sessionId
   * @returns {Promise<object|null>}
   */
  static async findRefreshTokenSessionById(sessionId) {
    return await RefreshTokenModel.findById(sessionId).lean();
  }

  /**
   * @param {string} sessionId
   * @param {{hashedToken: string, expiresAt?: Date}} updateData
   * @returns {Promise<object|null>}
   */
  static async updateRefreshTokenSession(sessionId, updateData) {
    return await RefreshTokenModel.findByIdAndUpdate(sessionId, updateData, {
      returnDocument: "after",
    }).lean();
  }

  /**
   * @param {string} sessionId
   * @returns {Promise<object|null>}
   */
  static async deleteRefreshTokenSessionById(sessionId) {
    return await RefreshTokenModel.findByIdAndDelete(sessionId).lean();
  }
}
