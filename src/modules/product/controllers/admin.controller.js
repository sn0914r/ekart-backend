import {
  addProductByAdmin,
  getProductForAdmin,
  getProductsForAdmin,
  updateProductByAdmin,
  deleteProductByAdmin,
} from "../services/index.js";

/**
 * @route POST /admin/products
 * @access Private
 */
export const addProductByAdminController = async (req, res) => {
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
export const getProductsForAdminController = async (req, res) => {
  const query = req.query;

  const { products, pagination } = await getProductsForAdmin(query);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
    pagination,
  });
};

/**
 * @route GET /admin/product
 * @access Private
 */
export const getProductForAdminController = async (req, res) => {
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
export const updateProductByAdminController = async (req, res) => {
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
export const deleteProductByAdminController = async (req, res) => {
  const { id } = req.params;

  const deleteProduct = await deleteProductByAdmin(id);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: deleteProduct,
  });
};
