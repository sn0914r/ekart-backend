const { getProductIdToPriceMap } = require("../db/product.db");

const calculateCartTotal = async (items) => {
  const productIds = items.map((item) => item.id);

  const pricesMap = await getProductIdToPriceMap(productIds);

  const totalAmount = items.reduce((sum, item) => {
    const { id: productId, quantity } = item;

    const price = pricesMap[productId];
    if (!price) {
      throw new Error(`Price not found for product ${productId}`);
    }

    return sum + pricesMap[productId] * quantity;
  }, 0);

  return totalAmount;
};

module.exports = { calculateCartTotal };
