import { PRODUCT } from "#constants/index.js";

const { SORT_PRICE, STOCK_STATUS, VALID_SORT_FIELDS, ACTIVE_STATUS } = PRODUCT;

/**
 * Parses and normalises pagination query params
 *
 * @param {{page?: string | number, limit?: string | number}} query
 * @returns {{page: number, limit: number, skip: number}}
 */
export const buildPagination = (query) => {
  let { page = 1, limit = 10 } = query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  limit = Math.min(limit, 50);
  const skip = (page - 1) * limit;
  return {
    page,
    limit,
    skip,
  };
};

/**
 * @typedef {object} ProductFilterQuery
 * @property {string} [minPrice]
 * @property {string} [maxPrice]
 * @property {string} [search]
 * @property {string} [category]
 * @property {string} [status]
 * @property {string} [stockStatus]
 */

/**
 * Builds a MongoDB filter object from query params
 *
 * @param {ProductFilterQuery} query
 * @returns {Record<string, unknown>} MongoDB filter object
 */
export const buildFilter = (query) => {
  const {
    minPrice = null,
    maxPrice = null,
    search = null,
    category = null,
    status = null,
    stockStatus = null,
  } = query;

  const filters = {};

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  if (category) filters.category = category;

  if (stockStatus && Object.keys(STOCK_STATUS).includes(stockStatus)) {
    if (stockStatus === STOCK_STATUS.IN_STOCK) {
      filters.stock = { $gt: 10 };
    } else if (stockStatus === STOCK_STATUS.LOW_STOCK) {
      filters.stock = { $gt: 0, $lte: 10 };
    } else if (stockStatus === STOCK_STATUS.OUT_OF_STOCK) {
      filters.stock = 0;
    }
  }

  // INFO: Customer service Fn overrides this value to Active
  if (status && Object.keys(ACTIVE_STATUS).includes(status)) {
    filters.isActive = ACTIVE_STATUS[status];
  }

  // INFO: This filter is used by customers only
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  return filters;
};

/**
 * Builds a MongoDB sort object from query params
 *
 * @param {{sort?: string}} query
 * @returns {Record<string, 1 | -1>} MongoDB sort object
 */
export const buildSort = (query) => {
  const { sort = null } = query;
  let sortOptions = {};

  if (!sort) {
    return sortOptions;
  }

  const sortedFields = sort.split(",");
  const filteredSortFields = sortedFields.filter((e) =>
    VALID_SORT_FIELDS.includes(e),
  );

  filteredSortFields.forEach((field) => {
    const isDec = field.startsWith("-") ? -1 : 1;
    const fieldM = isDec === -1 ? field.slice(1) : field;

    sortOptions[fieldM] = isDec;
  });

  // INFO: Used by customers
  if (sort === SORT_PRICE.PRICE_ASC) sortOptions = { price: 1 };
  if (sort === SORT_PRICE.PRICE_DESC) sortOptions = { price: -1 };
  if (sort === SORT_PRICE.NEWEST) sortOptions = { createdAt: -1 };

  if (!sortOptions.createdAt) {
    sortOptions.createdAt = -1;
  }

  return sortOptions;
};
