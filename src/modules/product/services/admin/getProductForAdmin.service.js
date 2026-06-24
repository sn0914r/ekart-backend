import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { AppError } from "../../../../errors/AppError.js";
import ProductModel from "../../product.model.js";

/**
 * @param {string} id - product id
 * @returns {Promise<object>} product
 */
export const getProductForAdmin = async (id) => {
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  return product;
};
