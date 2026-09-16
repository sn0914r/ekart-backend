import { Schema, model } from "mongoose";
import { PRODUCT } from "#constants/index.js";

const ProductSchema = new Schema(
  {
    name: String,
    price: { type: Number, min: 0 },
    stock: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
    category: {
      type: String,
      enum: Object.values(PRODUCT.CATEGORIES),
      required: true,
    },
    images: [String],
    description: String,
    attributes: {
      color: String,
      size: [String],
    },
  },
  { timestamps: true, versionKey: false },
);

const ProductModel = model("products", ProductSchema);
export default ProductModel;

