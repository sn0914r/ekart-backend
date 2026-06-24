import { redisClient } from "../../../../clients/redis.js";
import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { AppError } from "../../../../errors/AppError.js";
import ProductModel from "../../product.model.js";

/**
 * @param {string} id - product id
 * @returns {Promise<object>} deleted product
 */
export const deleteProductByAdmin = async (id) => {
  const product = await ProductModel.findOneAndDelete({ _id: id });

  if (!product) {
    throw new AppError("Product not found", 404, ERROR_CODES.NOT_FOUND_ERROR);
  }

  const keys = await redisClient.keys("products:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
  await redisClient.del(`product:${id}`);
  await redisClient.del(`product:colors:${product.name}`);

  return product;
};
