const { Schema, model } = require("mongoose");
const OrderSnapshotSchema = new Schema(
  {
    userId: {
      // TODO: make the datatype as Object Id
      //   type: Schema.Types.ObjectId,
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    items: [
      new Schema(
        {
          productId: {
            type: Schema.Types.ObjectId,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          name: String,
        },

        {
          _id: false,
        },
      ),
    ],
    subtotal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

const OrderSnapshotModel = model("ordersnapshots", OrderSnapshotSchema);
module.exports = OrderSnapshotModel;
