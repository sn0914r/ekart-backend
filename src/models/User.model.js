const { Schema, model } = require("mongoose");
const { ROLES } = require("../constants/roles");

const UserSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
  refreshToken: { type: String, default: null },
});

const UserModel = model("users", UserSchema);

// Drop stale unique index from previous Firebase implementation
UserModel.collection.dropIndex("uid_1").catch(() => {
  // Ignore if index doesn't exist
});

module.exports = UserModel;
