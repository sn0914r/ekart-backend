const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
  {
    name: String,
    price: { type: Number, min: 0 },
    stock: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
    imageUrl: String,
  },
  { timestamps: true, versionKey: false },
);

const ProductModel = model("products", ProductSchema);
module.exports = ProductModel;
