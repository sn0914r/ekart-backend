import ProductModel from "../../../../models/Product.model.js";
import { uploadImages } from "../../../../providers/cloudinary.js";

/**
 * @param {{files: Array, name: string, price: number, isActive: boolean, stock: number}}
 * @returns {Promise<object>}
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

  return product;
};
