import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { AppError } from "../../../../errors/AppError.js";
import ProductModel from "../../../../models/Product.model.js";

/**
 * @param {string} id - product id
 * @returns {Promise<object>} deleted product
 */
export const deleteProductByAdmin = async (id) => {
  const product = await ProductModel.findOneAndDelete({ _id: id });

  if (!product) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  return product;
};
