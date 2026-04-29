const buildFilter = (query) => {
  const { minPrice, maxPrice, search, category } = query;
  const filters = {};

  if (search) filters.name = { $regex: search, $options: "i" };
  if (category) filters.category = category;
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  return filters;
};

module.exports = { buildFilter };
