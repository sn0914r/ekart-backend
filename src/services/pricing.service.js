const { getProductIdToPriceMap } = require("../db/product.db");
const ProductModel = require("../models/Product.model");

const getPriceSnapShot = async (items) => {
  console.log(items, "before");
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
  // TODO: to be removed
  // const productIds = items.map((item) => item.id);
  // const priceMap = await getProductIdToPriceMap(productIds);

  // const itemsSnapshot = items.map((item) => {
  //   const { id, quantity } = item;
  //   const unitPrice = priceMap[id];
  //   const lineTotal = unitPrice * quantity;

  //   return {
  //     productId: id,
  //     unitPrice,
  //     quantity,
  //     lineTotal,
  //   };
  // });

  // const totalAmount = itemsSnapshot.reduce(
  //   (sum, item) => sum + item.lineTotal,
  //   0,
  // );

  const productIds = items.map((item) => item.id);
  const products = await ProductModel.find({ _id: { $in: productIds } });
  console.log("products:", products);
  const idToQtyMap = Object.fromEntries(
    items.map(({ id, quantity }) => [id, quantity]),
  );
  const itemsSnapshot = products.map((item) => {
    console.log(item, "in loop");
    return {
      productId: item.id,
      unitPrice: item.price,
      quantity: idToQtyMap[item.id],
      lineTotal: item.price * idToQtyMap[item.id],
    };
  });

  const totalAmount = itemsSnapshot.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  console.log("itemsSnapshot", itemsSnapshot);
  console.log("totalAmount", totalAmount);
  return {
    items: itemsSnapshot,
    totalAmount,
  };
};

module.exports = { getPriceSnapShot };
