import { redisClient } from "#clients/redis.js";
import { uploadImages } from "#providers/cloudinary.js";
import ProductModel from "../../product.model.js";

/** @import {ProductDocument} from '../../product.types.js' */

/**
 * @typedef {object} NewProductData
 * @property {Express.Multer.File[]} files
 * @property {string} name
 * @property {number} price
 * @property {boolean} isActive
 * @property {number} stock
 * @property {string} description
 * @property {string} category
 * @property {{color: string, size: string[]}} attributes
 */

/**
 * @param {NewProductData} productData
 * @returns {Promise<ProductDocument>} created product
 */
export const addProductByAdmin = async ({
  files,
  name,
  price,
  isActive,
  stock,
  description,
  category,
  attributes,
}) => {
  const images = await uploadImages(files);

  const product = await ProductModel.create({
    name,
    price,
    isActive,
    images,
    stock,
    description,
    category,
    attributes,
  });

  const keys = await redisClient.keys("products:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
  await redisClient.del(`product:colors:${name}`);

  return product;
};
