import ProductModel from "../../product.model.js";
import {
  buildFilter,
  buildPagination,
  buildSort,
} from "../../utils/query.utils.js";

/**
 * @param {object} query
 * @returns {Promise<{
 *   products: object[],
 *   pagination: {
 *     limit: number,
 *     page: number,
 *     totalPages: number,
 *     totalProducts: number
 *   }
 * }>}
 */
export const getProductsForAdmin = async (query) => {
  const filter = buildFilter(query);
  const sortOrder = buildSort(query);
  const { skip, limit, page } = buildPagination(query);

  const products = await ProductModel.find(filter, {
    name: 1,
    price: 1,
    stock: 1,
    images: { $slice: 1 },
    category: 1,
    isActive: 1,
    description: 1,
    attributes: 1,
  })
    .sort(sortOrder)
    .skip(skip)
    .limit(limit);

  const totalDocs = await ProductModel.countDocuments(filter);

  return {
    products,
    pagination: {
      limit,
      page,
      totalProducts: totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
    },
  };
};
