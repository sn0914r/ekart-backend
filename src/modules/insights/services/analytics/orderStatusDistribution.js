const OrderModel = require("../../../../models/Order/Order.model");

const orderStatusDistributionAggregation = OrderModel.aggregate([
  {
    $group: {
      _id: "$orderStatus",

      count: {
        $sum: 1,
      },
    },
  },
]);

module.exports = { orderStatusDistributionAggregation };
