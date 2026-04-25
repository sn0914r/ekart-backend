const AppError = require("../../errors/AppError");
const ProductModel = require("../../models/Product.model");
const cloudinaryIntegration = require("../../integrations/cloudinary");
const { ERROR_CODES } = require("../../constants/errorCodes");
const { formatMongoQuery } = require("./helpers/product.helper");

/**
 * Fetches Active products
 *
 * @param {object} query - queries for filters
 * @returns {object[]} - products
 */
const getActiveProducts = async (query) => {
  const { filter, sortOrder } = formatMongoQuery(query);
  filter.isActive = true;

  const products = await ProductModel.find(filter, {
    name: 1,
    price: 1,
    stock: 1,
    images: { $slice: 1 },
    stock: 1,
    category: 1,
    attributes: 1,
  }).sort(sortOrder);

  
  return products;
};

/**
 * Gets a single product details
 *
 * @param {string} id - product id
 * @returns {object} - product details
 */

const getActiveProductDetails = async (id) => {
  const product = await ProductModel.findById(id, {
    updatedAt: 0,
    createdAt: 0,
  });

  if (!product) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  if (!product.isActive) {
    throw new AppError(
      "Product is not active",
      400,
      ERROR_CODES.BAD_REQUEST_ERROR,
    );
  }

  
  return product;
};

/**
 * Gets the available colors of a product by its name
 *
 * @param {string} name - product name
 * @returns {object} - product details
 */
const getAvailableColorsOptionsByProductName = async (name) => {
  const productColors = await ProductModel.find(
    { name, isActive: true },
    {
      _id: 1,
      color: "$attributes.color",
    },
  );

  
  return productColors;
};

// ================================ Admin ================================

/**
 * @param {object} file - multer file object (req.file)
 * @param {string} name - product name
 * @param {number} price - in rupees
 * @param {boolean} isActive
 * @param {number} stock
 * @returns {object} added product details
 */
const addProductByAdmin = async ({
  files,
  name,
  price,
  isActive,
  stock,
  description,
  category,
  attributes,
}) => {
  const images = await cloudinaryIntegration.uploadImages(files);

  const product = await ProductModel.create({
    name,
    price,
    isActive,
    images,
    stock,
    description,
    category,
    attributes,
  });

  
  return product;
};

/**
 * Fetches all products
 *
 * @param {object} query - queries for filters
 * @returns {object[]} - products
 */
const getProductsForAdmin = async (query) => {
  const { filter, sortOrder } = formatMongoQuery(query);

  const products = await ProductModel.find(filter, {
    name: 1,
    price: 1,
    stock: 1,
    images: { $slice: 1 },
    stock: 1,
    category: 1,
    isActive: 1,
    description: 1,
    attributes: 1,
  }).sort(sortOrder);

  return products;
};

/**
 * Fetches a single product
 *
 * @param {string} id - product id
 * @returns {object} product
 * @throws {AppError} If product not found
 */
const getProductForAdmin = async (id) => {
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }
  
  return product;
};

/**
 * Updates the product
 *
 * @param {string} id - product id
 * @param {object} updates - updates to be applied
 * @returns {object} updated product
 * @throws {AppError} If product not found
 */
const updateProductByAdmin = async (id, updates) => {
  const product = await ProductModel.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { runValidators: true, new: true },
  );

  if (!product) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }
  
  return product;
};

/**
 * Deletes the product
 *
 * @param {string} id - product id
 * @returns {object} deleted product
 * @throws {AppError} If product not found
 */
const deleteProductByAdmin = async (id) => {
  const product = await ProductModel.findOneAndDelete({ _id: id });

  if (!product) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }
  
  return product;
};

module.exports = {
  getActiveProducts,
  getActiveProductDetails,
  getAvailableColorsOptionsByProductName,

  addProductByAdmin,
  getProductsForAdmin,
  updateProductByAdmin,
  deleteProductByAdmin,
  getProductForAdmin,
};
