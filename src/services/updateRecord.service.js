const { db } = require("../configs/firebase.config");
const AppError = require("../errors/AppError");

const updateRecord = async (id, updates) => {
  try {
    await db.collection("orders").doc(id).update(updates);
    const updatedRecord = await db.collection("orders").doc(id).get();

    return {
      id: updatedRecord.id,
      ...updatedRecord.data(),
    };
  } catch (error) {
    throw new AppError(error, 500);
  }
};

module.exports = updateRecord;
