import { redisClient } from "../../../../clients/redis.js";
import ProductModel from "../../product.model.js";
import {
  buildFilter,
  buildPagination,
  buildSort,
} from "../../utils/query.utils.js";

/**
 * @param {object} query - queries for filters
 * @returns {Promise<{
 *   page: number,
 *   totalPages: number,
 *   totalItems: number,
 *   products: object[]
 * }>}
 */
export const getActiveProducts = async (query) => {
  const key = `products:${JSON.stringify(query) || ""}`;

  const cachedProductsData = await redisClient.get(key);

  if (cachedProductsData) {
    return JSON.parse(cachedProductsData);
  }

  const filter = buildFilter(query);
  filter.isActive = true;

  const sortOrder = buildSort(query);

  const { page, limit, skip } = buildPagination(query);

  const products = await ProductModel.find(filter, {
    name: 1,
    price: 1,
    stock: 1,
    images: { $slice: 1 },
    category: 1,
    attributes: 1,
  })
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .select("name price stock images category attributes");

  const total = await ProductModel.countDocuments(filter);

  const data = {
    page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    products,
  };

  await redisClient.setEx(key, 300, JSON.stringify(data));

  return data;
};
