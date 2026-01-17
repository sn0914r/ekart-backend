const { getProductIdToPriceMap } = require("../db/product.db");

// TODO: to be removed
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

const getPriceSnapShot = async (items) => {
  /**
  items: [
    {
      productId: "p1",
      name: "Product Name",
      unitPrice: 299,     // snapshot price at checkout time
      qty: 2,
      lineTotal: 598
    }
  ],
   */

  const productIds = items.map((item) => item.id);
  const priceMap = await getProductIdToPriceMap(productIds);

  const itemsSnapshot = items.map((item) => {
    const { id, quantity } = item;
    const unitPrice = priceMap[id];
    const lineTotal = unitPrice * quantity;

    return {
      productId: id,
      unitPrice,
      quantity,
      lineTotal,
    };
  });

  const totalAmount = itemsSnapshot.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );

  return {
    items: itemsSnapshot,
    totalAmount,
  };
};

module.exports = { calculateCartTotal, getPriceSnapShot };
