const {
  addProductByAdmin,
  getProductsForAdmin,
  getProductForAdmin,
  updateProductByAdmin,
  deleteProductByAdmin,
  getActiveProducts,
  getActiveProductDetails,
  getAvailableColorsOptionsByProductName,
} = require("./product.service");

/**
 * @route GET /products
 * @access Public
 */
const getActiveProductsController = async (req, res) => {
  const query = req.query;
  const products = await getActiveProducts(query);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
  });
};

/**
 * @route GET /products/:id
 * @access Public
 */
const getActiveProductDetailsController = async (req, res) => {
  const { id } = req.params;

  const product = await getActiveProductDetails(id);
  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: product,
  });
};

/**
 * @route GET /products/colors?name=productName
 * @access Public
 */

const getAvailableColorsOptionsByProductNameController = async (req, res) => {
  const { name } = req.query;
  const colors = await getAvailableColorsOptionsByProductName(name);
  res.status(200).json({
    success: true,
    message: "Available colors fetched successfully",
    data: colors,
  });
};

// ================================ Admin ================================

/**
 * @route POST /admin/products
 * @access Private
 */
const addProductByAdminController = async (req, res) => {
  const { files } = req;
  const { name, price, isActive, stock, description, category, attributes } =
    req.body;

  const product = await addProductByAdmin({
    files,
    name,
    price,
    isActive,
    stock,
    description,
    category,
    attributes,
  });

  res.status(200).json({
    success: true,
    message: "Product added successfully",
    data: product,
  });
};

/**
 * @route GET /admin/products
 * @access Private
 */
const getProductsForAdminController = async (req, res) => {
  const query = req.query;
  
  const products = await getProductsForAdmin(query);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
  });
};

/**
 * @route GET /admin/product
 * @access Private
 * @desc Get single product
 */
const getProductForAdminController = async (req, res) => {
  const { id } = req.params;
  const product = await getProductForAdmin(id);
  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    data: product,
  });
};

/**
 * @route PATCH /admin/products/:id
 * @access Private
 */
const updateProductByAdminController = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedProduct = await updateProductByAdmin(id, updates);
  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
};

/**
 * @route DELETE /admin/products/:id
 * @access Private
 */
const deleteProductByAdminController = async (req, res) => {
  const { id } = req.params;
  const deleteProduct = await deleteProductByAdmin(id);
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: deleteProduct,
  });
};

module.exports = {
  getActiveProductsController,
  getActiveProductDetailsController,
  getAvailableColorsOptionsByProductNameController,

  addProductByAdminController,
  getProductForAdminController,
  getProductsForAdminController,
  updateProductByAdminController,
  deleteProductByAdminController,
};
