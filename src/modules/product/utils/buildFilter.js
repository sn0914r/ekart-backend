const { PRODUCT_STATUS, STOCK_STATUS } = require("../../../constants/product");
const { logger } = require("../../../utils/logger");

const buildFilter = (query) => {
  logger.info("req.query " + JSON.stringify(query));
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

module.exports = { buildFilter };
