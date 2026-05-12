const { SORT } = require("../../../constants/productQuery");

const buildSort = (query) => {
  const { sort } = query;
  let sortOptions = { createdAt: -1 };

  if (sort === SORT.PRICE_ASC) sortOptions = { price: 1 };
  if (sort === SORT.PRICE_DESC) sortOptions = { price: -1 };
  if (sort === SORT.NEWEST) sortOptions = { createdAt: -1 };

  return sortOptions;
};

module.exports = { buildSort };
