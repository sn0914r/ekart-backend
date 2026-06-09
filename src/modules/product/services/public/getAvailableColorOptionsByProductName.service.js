import ProductModel from "../../../../models/Product.model.js";

/**
 * Gets the available colors of a product by its name
 *
 * @param {string} name - product name
 * @returns {Promise<object>}
 */
export const getAvailableColorsOptionsByProductName = async (name) => {
  const productColors = await ProductModel.find(
    { name, isActive: true },
    {
      _id: 1,
      color: "$attributes.color",
    },
  );

  return productColors;
};
