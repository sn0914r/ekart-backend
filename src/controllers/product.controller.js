const {
  addProduct,
  getProducts,
  updateProduct,
} = require("../services/product.service");

/**
 * Add product in the database
 */
const addProductController = async (req, res) => {
  const { file } = req;
  const { name, price, isActive, stock } = req.body;

  const product = await addProduct({ file, name, price, isActive, stock });

  res.status(200).json(product);
};

/**
 * Retrive Products from the database
 */
const getProductsController = async (req, res) => {
  const products = await getProducts();
  res.status(200).json(products);
};

/**
 * Update a specific Product in the database
 */
const updateProductController = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedProduct = await updateProduct(id, updates);
  res.status(200).json(updatedProduct);
};

module.exports = {
  addProductController,
  getProductsController,
  updateProductController,
};
