const { Schema, model } = require("mongoose");
const { ROLES } = require("../constants/roles");

const UserSchema = new Schema(
  {
    uid: String,
    name: String,
    email: String,
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
  },
  { timestamps: true, versionKey: false },
);

const UserModel = model("users", UserSchema);
module.exports = UserModel;
