const getProductsByIds = require("../utils/getProductsByIDs");

const getTotalPrice = async (items) => {
  const productIds = items.map((item) => item.productId);
  const targetDocs = await getProductsByIds(productIds);
  const productMap = Object.fromEntries(
    targetDocs.map((doc) => [doc.productId, doc.price])
  );

  const totalPrice = items.reduce((sum, item) => {
    const price = productMap[item.productId];
    return sum + price * item.quantity;
  }, 0);

  return totalPrice;
};

/** STEPS
 * Separate the product ids from the cart
 * Fetch only the required documents from the FIRESTORE (Flatten the snapshot into plain js object)
 * Match cart item with product id and calculate the total price for the target quantity
 * Calculate the total price
 */

// getTotalPrice([
//   { productId: "R5cKAqmqR6E67ZKDrZAl", quantity: 3 },
//   { productId: "cHqv6R40qK0kzWyiLO1x", quantity: 2 },
//   { productId: "dx7uaqajPcgy9eSt89lz", quantity: 1 },
// ]);

module.exports = getTotalPrice;
