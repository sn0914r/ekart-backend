import ProductModel from "../../../../models/Product.model.js";
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

  return {
    page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    products,
  };
};
