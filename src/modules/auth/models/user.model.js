import { Schema, model } from "mongoose";
import { ROLES } from "#constants/index.js";

const UserSchema = new Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
});

const UserModel = model("Users", UserSchema);
export default UserModel;
