import OrderModel from "#modules/order/order.model.js";

export const orderStatusDistributionAggregation = () =>
  OrderModel.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: {
          $sum: 1,
        },
      },
    },
  ]);
