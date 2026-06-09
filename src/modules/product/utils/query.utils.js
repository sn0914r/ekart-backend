import {
  PRODUCT_STATUS,
  SORT,
  STOCK_STATUS,
  VALID_SORT_FIELDS_LIST,
} from "../../../constants/product.js";

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
  if (status && Object.keys(PRODUCT_STATUS).includes(status)) {
    filters.isActive = PRODUCT_STATUS[status];
  }

  // INFO: This filter is used by customers only
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  return filters;
};

export const buildSort = (query) => {
  const { sort = null } = query;
  let sortOptions = {};

  if (!sort) {
    return sortOptions;
  }

  const sortedFields = sort.split(",");
  const filteredSortFields = sortedFields.filter((e) =>
    VALID_SORT_FIELDS_LIST.includes(e),
  );

  filteredSortFields.forEach((field) => {
    const isDec = field.startsWith("-") ? -1 : 1;
    const fieldM = isDec === -1 ? field.slice(1) : field;

    sortOptions[fieldM] = isDec;
  });

  // INFO: Used by customers
  if (sort === SORT.PRICE_ASC) sortOptions = { price: 1 };
  if (sort === SORT.PRICE_DESC) sortOptions = { price: -1 };
  if (sort === SORT.NEWEST) sortOptions = { createdAt: -1 };

  if (!sortOptions.createdAt) {
    sortOptions.createdAt = -1;
  }

  return sortOptions;
};
