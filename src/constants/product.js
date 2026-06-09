export const SORT = {
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
  NEWEST: "newest",
};

export const PRODUCT_STATUS = {
  ACTIVE: true,
  NOT_ACTIVE: false,
};

export const STOCK_STATUS = {
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
};

export const VALID_SORT_FIELDS_LIST = [
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