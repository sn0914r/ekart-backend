import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { AppError } from "../../../../errors/AppError.js";
import ProductModel from "../../../../models/Product.model.js";

/**
 * Gets a single active product details
 *
 * @param {string} id - product id
 * @returns {Promise<object>} - product details
 */
export const getActiveProductDetails = async (id) => {
  const product = await ProductModel.findById(id, {
    updatedAt: 0,
    createdAt: 0,
  });

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  return product;
};
