const { db } = require("../configs/firebase.config");

const createDoc = async (collection, data) => {
  const ref = await db.collection(collection).add(data);
  return ref.id;
};

const updateDoc = async (collection, docId, data) => {
  const ref = db.collection(collection).doc(docId);
  await ref.update(data);
  const updatedDoc = await ref.get();
  return updatedDoc.data();
};

const getDoc = async (collection, docId) => {
  const snap = await db.collection(collection).doc(docId).get();
  return {
    id: snap.id,
    ...snap.data(),
  };
};

const getDocs = async (collection) => {
  const snap = await db.collection(collection).get();
  const docs = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return docs;
};

module.exports = { createDoc, updateDoc, getDoc, getDocs };
