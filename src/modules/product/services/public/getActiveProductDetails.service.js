import { redisClient } from "#clients/redis.js";
import { ERROR_CODES } from "#constants/index.js";
import { AppError } from "#errors/AppError.js";
import ProductModel from "../../product.model.js";

/**
 * Gets a single active product details
 *
 * @param {string} id - product id
 * @returns {Promise<object>} - product details
 */
export const getActiveProductDetails = async (id) => {
  const key = `product:${id}`;

  const cachedProduct = await redisClient.get(key);

  if (cachedProduct) {
    return JSON.parse(cachedProduct);
  }

  const product = await ProductModel.findById(id, {
    updatedAt: 0,
    createdAt: 0,
  });

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  await redisClient.set(key, JSON.stringify(product));

  return product;
};
