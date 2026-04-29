const buildPagination = (query) => {
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

module.exports = { buildPagination };
