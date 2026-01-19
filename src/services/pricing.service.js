const { getProductIdToPriceMap } = require("../db/product.db");

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
    0,
  );

  return {
    items: itemsSnapshot,
    totalAmount,
  };
};

module.exports = { getPriceSnapShot };
