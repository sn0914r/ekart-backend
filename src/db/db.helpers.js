const { db } = require("../configs/firebase.config");

const createDoc = async (collection, data) => {
  const ref = await db.collection(collection).add(data);
  return ref.id;
};

module.exports = { createDoc };
