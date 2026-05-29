const SORT = {
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
  NEWEST: "newest",
};

const PRODUCT_STATUS = {
  ACTIVE: true,
  NOT_ACTIVE: false,
};

const STOCK_STATUS = {
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
};

const VALID_SORT_FIELDS = [
  "name",
  "-name",
  "price",
  "-price",
  "stock",
  "-stock",
  "createdAt",
  "-createdAt",
  "category",
  "-category"
];

module.exports = { SORT, PRODUCT_STATUS, STOCK_STATUS, VALID_SORT_FIELDS };
