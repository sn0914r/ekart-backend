import {
  getActiveProducts,
  getActiveProductDetails,
  getAvailableColorsOptionsByProductName,
} from "../services/index.js";

/**
 * @route GET /products
 * @access Public
 */
export const getActiveProductsController = async (req, res) => {
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
export const getActiveProductDetailsController = async (req, res) => {
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
export const getAvailableColorsOptionsByProductNameController = async (
  req,
  res,
) => {
  const { name } = req.query;
  const colors = await getAvailableColorsOptionsByProductName(name);
  res.status(200).json({
    success: true,
    message: "Available colors fetched successfully",
    data: colors,
  });
};
