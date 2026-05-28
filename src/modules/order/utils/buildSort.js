const { VALID_ORDER_SORT_FIELDS_ADMIN } = require("../../../constants/order");
const { logger } = require("../../../utils/logger");

const buildSortFilter = (query) => {
  const { sort = null } = query;
  const sortFilters = {};

  if (!sort) {
    sortFilters.createdAt = -1;
    return sortFilters;
  }

  const allSortFields = sort.split(",");
  const validSortFields = allSortFields.filter((field) =>
    VALID_ORDER_SORT_FIELDS_ADMIN.includes(field),
  );

  validSortFields.forEach((e) => {
    const isDesc = e.startsWith("-") ? -1 : 1;
    field = isDesc === -1 ? e.slice(1) : e;

    sortFilters[field] = isDesc;
  });

  if (!sortFilters.createdAt) {
    sortFilters.createdAt = -1;
  }

  return sortFilters;
};

module.exports = { buildSortFilter };
