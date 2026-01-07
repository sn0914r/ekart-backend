const AppError = require("../errors/AppError");
const addRecord = require("../services/createRecord.service");
const uploadImage = require("../services/uploadImage.service");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

const createProduct = asyncErrorHandler(async (req, res, next) => {
  const { file } = req;
  if (!file) {
    console.log("error");
  }
  const { name, price, isActive } = req.body;
  const timestamp = new Date();
  file.timestamp = timestamp;

  try {
    const imageUrl = await uploadImage(file);

    const product = {
      name,
      price,
      isActive,
      imageUrl,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const productId = await addRecord(product);

    res.status(200).json({
      success: true,
      data: {
        productId,
        product,
      },
      message: "product added successfully",
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(error, 500));
  }
});

module.exports = createProduct;
