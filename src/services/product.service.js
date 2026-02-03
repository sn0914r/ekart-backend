const AppError = require("../errors/AppError");
const ProductModel = require("../models/Product.model");
const UserModel = require("../models/User.model");
const cloudinaryIntegration = require("../integrations/cloudinary.integration");

/**
 * @desc Add Product
 *
 * Side Effects:
 *  - Uploads image to Cloudinary
 *  - Creates a new product
 *
 * @returns {Promise<Product>} The created product
 * @throws {AppError} If image upload fails
 */
const addProduct = async ({ file, name, price, isActive, stock }) => {
  const imageUrl = await cloudinaryIntegration.uploadImage(file.buffer);

  const product = await ProductModel.create({
    name,
    price,
    isActive,
    imageUrl,
    stock,
  });

  return product;
};

/**
 * @desc Retrive active products
 *
 * Behaviour:
 *  - Admin users can see all products
 *  - Non-admin users can only see active products
 *
 * @returns {Promise<Product[]>} List of products
 */

const getProducts = async ({ userId, role, query }) => {
  const { filter, sortOrder } = formatMongoQuery(query);

  if (userId && role === "admin") {
    const user = await UserModel.findOne({ uid: userId });
    if (user.role === "admin") {
      const products = await ProductModel.find(filter).sort(sortOrder);
      return products;
    }
  }
  const products = await ProductModel.find({ isActive: true, ...filter }).sort(
    sortOrder,
  );
  return products;
};

/**
 * @desc Update Product
 *
 * Side Effects:
 *  - Updates product
 *
 * @returns {Promise<Product>} The updated product
 * @throws {AppError} If product not found
 */
const updateProduct = async (id, updates) => {
  const product = await ProductModel.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { runValidators: true, new: true },
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
};

// Supporting functions
/**
 * @desc Formats the request query into a MongoDB query
 *
 * @returns {Object} MongoDB query
 */
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
