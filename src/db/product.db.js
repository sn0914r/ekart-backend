const { db } = require("../configs/firebase.config");

/**
 * @returns {Object.<string, number>} - id : price
 */
const getProductIdToPriceMap = async (productIds) => {
  const dbRef = db.collection("products");

  const snapshots = await Promise.all(
    productIds.map((id) => dbRef.doc(id).get())
  );

  const idsByPrices = snapshots.map((doc) => {
    const { price } = doc.data();
    return [doc.id, price];
  });

  return Object.fromEntries(idsByPrices);
};

/**
 * Retrives all active products
 */
const getActiveProducts = async () => {
  const snapshot = await db
    .collection("products")
    .where("isActive", "==", true)
    .get();

  const products = snapshot.docs.map((doc) => {
    const { imageUrl, name, price, stock } = doc.data();
    return {
      id: doc.id,
      name,
      price,
      imageUrl,
      stock,
    };
  });

  return products;
};

module.exports = { getProductIdToPriceMap, getActiveProducts };
