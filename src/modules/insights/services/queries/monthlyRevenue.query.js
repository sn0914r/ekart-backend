import OrderModel from "#modules/order/order.model.js";
import { ORDER } from "#constants/index.js";

export const monthlyRevenueAggregation = () =>
  OrderModel.aggregate([
    {
      $match: {
        paymentStatus: ORDER.PAYMENT_STATUS.PAID,
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
