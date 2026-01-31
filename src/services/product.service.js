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
const getProducts = async ({ userId, role }) => {
  if (userId) {
    const user = await UserModel.findOne({ uid: userId });
    if (user.role === "admin") {
      const products = await ProductModel.find({});
      return products;
    }
  }
  const products = await ProductModel.find({ isActive: true });
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
