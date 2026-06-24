import ProductModel from "../../product.model.js";
import { redisClient } from "../../../../clients/redis.js";

/**
 * Gets the available colors of a product by its name
 *
 * @param {string} name - product name
 * @returns {Promise<{_id: string, color: string}[]>}
 */
export const getAvailableColorsOptionsByProductName = async (name) => {
  const key = `product:colors:${name}`;
  const cachedColors = await redisClient.get(key);

  if (cachedColors) {
    return JSON.parse(cachedColors);
  }

  const productColors = await ProductModel.find(
    { name, isActive: true },
    {
      _id: 1,
      color: "$attributes.color",
    },
  );

  await redisClient.set(key, JSON.stringify(productColors));

  return productColors;
};
