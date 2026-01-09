const { db } = require("../configs/firebase.config");

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

module.exports = { getProductIdToPriceMap };
