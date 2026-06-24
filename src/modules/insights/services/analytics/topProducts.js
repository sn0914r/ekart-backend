import OrderModel from "../../../order/OrderModel/order.model.js";

export const topProductsAggregation = OrderModel.aggregate([
  {
    $match: {
      paymentStatus: "PAID",
    },
  },

  {
    $unwind: "$orderSnapshot",
  },

  {
    $group: {
      _id: "$orderSnapshot.productId",

      revenue: {
        $sum: "$orderSnapshot.lineTotal",
      },

      totalSold: {
        $sum: "$orderSnapshot.quantity",
      },

      productName: {
        $first: "$orderSnapshot.name",
      },
    },
  },

  {
    $sort: {
      revenue: -1,
    },
  },

  {
    $limit: 5,
  },

  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product",
    },
  },

  {
    $unwind: "$product",
  },

  {
    $project: {
      revenue: 1,
      totalSold: 1,
      productName: 1,

      image: {
        $arrayElemAt: ["$product.images", 0],
      },
    },
  },
]);
