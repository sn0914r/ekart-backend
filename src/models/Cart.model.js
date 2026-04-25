const { Schema, model } = require("mongoose");

const CartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    variant: {
      size: String,
    },
  },
  {
    _id: false,
    timestamps: false,
  },
);

const CartSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

module.exports = model("cart", CartSchema);
