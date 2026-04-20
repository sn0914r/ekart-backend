const { Schema, model } = require("mongoose");

const CartItemSchema = new Schema(
  {
    productId: String,
    quantity: Number,
  },
  {
    _id: false,
    timestamps: false,
  },
);

const CartSchema = new Schema(
  {
    items: [CartItemSchema],
    uid: String,
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

module.exports = model("cart", CartSchema);
