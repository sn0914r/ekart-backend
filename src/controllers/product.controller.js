const productService = require("../services/product.service");

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

  res.status(200).json(product);
};

/**
 * @desc Retrives all products
 
 * Preconditions:
 *  - Request is authenticated
 *  - req.user.role is either "user" or "admin"
 *
 * @route GET /products
 * @route GET /admin/products
 * @access Private
 */
const getProductsController = async (req, res) => {
  const { uid: userId, role } = req.user;
  const products = await productService.getProducts({ userId, role });
  res.status(200).json(products);
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
  res.status(200).json(updatedProduct);
};

module.exports = {
  addProductController,
  getProductsController,
  updateProductController,
};
