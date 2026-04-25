const formatMongoQuery = (query) => {
  const { search, minPrice, maxPrice, sort } = query;
  let filter = {};
  let sortOrder = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = minPrice;
    if (maxPrice) filter.price.$lte = maxPrice;
  }

  sort === "price_asc" && (sortOrder.price = 1);
  sort === "price_desc" && (sortOrder.price = -1);
  sortOrder.createdAt = -1;

  return { filter, sortOrder };
};

module.exports = { formatMongoQuery };
