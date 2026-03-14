const productService = require("./product.service");

/**
 * @desc Add Product
 *
 * Preconditions:
 *  - Request is authenticated
 *  - req.body contains valid name, price, isActive, stock
 *  - req.file is a valid image
 *
 * @route POST /admin/products
 * @access Private
 */
const addProductController = async (req, res) => {
  const { file } = req;
  const { name, price, isActive, stock } = req.body;

  const product = await productService.addProduct({
    file,
    name,
    price,
    isActive,
    stock,
  });

  res.status(200).json({
    success: true,
    message: "Product added successfully",
    data: product,
  });
};

/**
 * @desc Retrives all products
 
 * Preconditions:
 *  - Request is authenticated
 *  - req.user.role is either "user" or "admin"
 *
 * @route GET /products
 * @route GET /admin/products
 * @access Public
 */
const getProductsController = async (req, res) => {
  const userId = req.user?.uid;
  const role = req.user?.role;
  const query = req.query;

  const products = await productService.getProducts({ userId, role, query });
  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
  });
};

/**
 * @desc Update Product
 *
 * Preconditions:
 *  - Request is authenticated
 *  - req.user.role is "admin"
 *  - req.params.id is valid
 *  - req.body contains valid updates
 *
 * @route PATCH /admin/products/:id
 * @access Private
 */
const updateProductController = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedProduct = await productService.updateProduct(id, updates);
  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
};

const deleteProductController = async (req, res) => {
  const { id } = req.params;
  const deleteProduct = await productService.deleteProduct(id);
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: deleteProduct,
  });
};

const getProductController = async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProduct(id);
  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: product,
  });
};

module.exports = {
  addProductController,
  getProductsController,
  updateProductController,
  deleteProductController,
  getProductController,
};
