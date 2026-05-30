const { SORT, VALID_SORT_FIELDS } = require("../../../constants/product");
const { logger } = require("../../../utils/logger");

const buildSort = (query) => {
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
  if (sort === SORT.PRICE_ASC) sortOptions = { price: 1 };
  if (sort === SORT.PRICE_DESC) sortOptions = { price: -1 };
  if (sort === SORT.NEWEST) sortOptions = { createdAt: -1 };

  if (!sortOptions.createdAt) {
    sortOptions.createdAt = -1;
  }

  return sortOptions;
};

module.exports = { buildSort };
