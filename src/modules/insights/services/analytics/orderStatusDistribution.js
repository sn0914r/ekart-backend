import OrderModel from "../../../../models/Order/Order.model.js";

export const orderStatusDistributionAggregation = OrderModel.aggregate([
  {
    $group: {
      _id: "$orderStatus",

      count: {
        $sum: 1,
      },
    },
  },
]);
