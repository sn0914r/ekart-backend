import { redisClient } from "../../../../clients/redis.js";
import { ERROR_CODES } from "../../../../constants/errorCodes.js";
import { AppError } from "../../../../errors/AppError.js";
import ProductModel from "../../product.model.js";

/**
 * @param {string} id - product id
 * @param {object} updates
 * @returns {Promise<object>} updated product
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
