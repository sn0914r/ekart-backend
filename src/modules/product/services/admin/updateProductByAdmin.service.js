import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { AppError } from "../../../../errors/AppError.js";
import ProductModel from "../../../../models/Product.model.js";

/**
 * @param {string} id - product id
 * @param {object} updates
 * @returns {Promise<object>} updated product
 */
export const updateProductByAdmin = async (id, updates) => {
  const product = await ProductModel.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { runValidators: true, new: true },
  );

  if (!product) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  return product;
};
