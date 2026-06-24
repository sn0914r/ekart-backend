import OrderModel from "../../../order/OrderModel/order.model.js";

export const monthlyRevenueAggregation = OrderModel.aggregate([
  {
    $match: {
      paymentStatus: "PAID",
    },
  },
  {
    $group: {
      _id: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      },

      revenue: {
        $sum: "$subTotal",
      },
      count: {
        $sum: 1,
      },
    },
  },
  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1,
    },
  },
]);
