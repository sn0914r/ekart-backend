import { redisClient } from "#clients/redis.js";
import { PRODUCT } from "#constants/index.js";
import ProductModel from "../../product.model.js";

/**
 * @typedef {object} MetaOption
 * @property {string} label
 * @property {string} value
 */

/**
 * @typedef {object} ProductMeta
 * @property {MetaOption[]} categories
 * @property {MetaOption[]} sortOptions
 * @property {MetaOption[]} stockStatuses
 * @property {MetaOption[]} productStatuses
 * @property {{min: number, max: number}} priceRange
 */

/**
 * fetches product metadata including active categories, sort options, stock statuses, and price range.
 * @returns {Promise<ProductMeta>}
 */
export const getProductMeta = async () => {
  const key = "products:meta";

  const cachedMeta = await redisClient.get(key);
  if (cachedMeta) {
    return JSON.parse(cachedMeta);
  }

  const [categories, priceAggregation] = await Promise.all([
    ProductModel.distinct("category", { isActive: true }),
    ProductModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]),
  ]);

  const categoryOptions = categories
    .filter(Boolean)
    .sort()
    .map((cat) => ({
      label: cat,
      value: cat,
    }));

  const sortOptions = [
    { label: "Newest", value: PRODUCT.SORT_PRICE.NEWEST },
    { label: "Price: Low to High", value: PRODUCT.SORT_PRICE.PRICE_ASC },
    { label: "Price: High to Low", value: PRODUCT.SORT_PRICE.PRICE_DESC },
  ];

  const stockStatuses = [
    { label: "In Stock", value: PRODUCT.STOCK_STATUS.IN_STOCK },
    { label: "Low Stock", value: PRODUCT.STOCK_STATUS.LOW_STOCK },
    { label: "Out of Stock", value: PRODUCT.STOCK_STATUS.OUT_OF_STOCK },
  ];

  const productStatuses = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "NOT_ACTIVE" },
  ];

  const priceRange =
    priceAggregation.length > 0
      ? {
          min: priceAggregation[0].minPrice ?? 0,
          max: priceAggregation[0].maxPrice ?? 0,
        }
      : { min: 0, max: 0 };

  const data = {
    categories: categoryOptions,
    sortOptions,
    stockStatuses,
    productStatuses,
    priceRange,
  };

  await redisClient.setex(key, 3600, JSON.stringify(data));

  return data;
};
