import { Schema, model } from "mongoose";

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
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    items: [CartItemSchema],
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

const CartModel = model("cart", CartSchema);
export default CartModel;
