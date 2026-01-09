const { db } = require("../configs/firebase.config");
const AppError = require("../errors/AppError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

const getProducts = asyncErrorHandler(async (req, res, next) => {
  try {
    const snapshot = await db
      .collection("products")
      .where("isActive", "==", true)
      .get();

    const products = snapshot.docs.map((doc) => {
      const { imageUrl, name, price } = doc.data();

      return {
        productId: doc.id,
        imageUrl,
        name,
        price,
      };
    });

    res.status(200).json({ success: true, products, size: products.length });
  } catch (error) {
    next(new AppError(error, 500));
  }
});

module.exports = getProducts;
