import { ERROR_CODES } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";
import ProductModel from "../../product.model.js";

/** @import {ProductDocument} from '../../product.types.js' */

/**
 * @param {string} id - product id
 * @returns {Promise<ProductDocument>} product document
 */
export const getProductForAdmin = async (id) => {
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  return product;
};
