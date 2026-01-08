const { admin, db } = require("../configs/firebase.config");

const getProductsByIds = async (productIds) => {
  let chunks = [];

  for (let i = 0; i < productIds.length; i += 10) {
    let chunk = productIds.slice(i, i + 10);
    chunks.push(chunk);
  }

  const snaps = await Promise.all(
    chunks.map((chunk) =>
      db
        .collection("products")
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get()
    )
  );

  return snaps.flatMap((snap) =>
    snap.docs.map((doc) => ({
      productId: doc.id,
      ...doc.data(),
    }))
  );
};

module.exports = getProductsByIds;
