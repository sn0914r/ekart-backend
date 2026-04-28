const { Schema, model } = require("mongoose");

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: {
      createdAt: true,
    },
    versionKey: false,
  },
);

wishlistSchema.index({ user: 1 });

module.exports = model("Wishlist", wishlistSchema);
