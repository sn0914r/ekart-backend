import { Schema } from "mongoose";

export const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId },
    quantity: Number,
    unitPrice: Number,
    name: String,
    imageUrl: String,
    lineTotal: Number,
  },
  { _id: false },
);
