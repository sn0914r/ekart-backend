const { addProduct, getProducts } = require("../services/product.service");

/**
 * Add product in the database
 */
const addProductController = async (req, res) => {
  const { file } = req;
  const { name, price, isActive } = req.body;

  const product = await addProduct({ file, name, price, isActive });

  res.status(200).json(product);
};

/**
 * Retrive Products from the database
 */

const getProductsController = async (req, res) => {
  const products = await getProducts();
  res.status(200).json(products);
};

module.exports = { addProductController, getProductsController };
