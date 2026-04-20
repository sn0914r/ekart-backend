const { Schema } = require("mongoose");

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId },
    quantity: Number,
    unitPrice: Number,
    name: String,
    imageURL: String,
    lineTotal: Number,
  },
  { _id: false },
);

module.exports = OrderItemSchema;
