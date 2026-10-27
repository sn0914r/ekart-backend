import { Schema, model } from "mongoose";
import { ROLES } from "#constants/index.js";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    phone: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isDeleted: 1 });

const UserModel = model("Users", UserSchema);
export default UserModel;
