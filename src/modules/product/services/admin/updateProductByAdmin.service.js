import { redisClient } from "#clients/redis.js";
import { ERROR_CODES } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";
import ProductModel from "../../product.model.js";

/** @import {ProductDocument} from '../../product.types.js' */

/**
 * @typedef {object} ProductUpdates
 * @property {string} [name]
 * @property {number} [price]
 * @property {number} [stock]
 * @property {boolean} [isActive]
 * @property {string} [category]
 * @property {string} [description]
 * @property {{color?: string, size?: string[]}} [attributes]
 */

/**
 * @param {string} id - product id
 * @param {ProductUpdates} updates
 * @returns {Promise<ProductDocument>} updated product
 */
export const updateProductByAdmin = async (id, updates) => {
  const oldProduct = await ProductModel.findById(id);
  if (!oldProduct) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const product = await ProductModel.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { runValidators: true, new: true },
  );

  const keys = await redisClient.keys("products:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
  await redisClient.del(`product:${id}`);
  await redisClient.del(`product:colors:${oldProduct.name}`);

  return product;
};
