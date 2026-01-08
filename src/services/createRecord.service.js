const { db } = require("../configs/firebase.config");
const AppError = require("../errors/AppError");

const createRecord = async (details, collectionName = "products") => {
  try {
    const ref = await db.collection(collectionName).add(details);
    return ref.id;
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};

module.exports = createRecord;
