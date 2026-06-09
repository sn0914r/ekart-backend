import { Schema, model } from "mongoose";
const RefreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hashedToken: String,
    expiresAt: {
      type: Date,
      index: { expires: "0s" },
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  },
);

const RefreshTokenModel = model("RefreshTokens", RefreshTokenSchema);
export default RefreshTokenModel;
