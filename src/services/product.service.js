const { bucket, db } = require("../configs/firebase.config");

const AppError = require("../errors/AppError");
const generateRandomString = require("../utils/randomStringGenerator");
const ProductModel = require("../models/Product.model");

const uploadProductImage = async (file) => {
  const filename = generateRandomString();
  const fileUpload = bucket.file(filename);
  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  });
  await fileUpload.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  return publicUrl;
};

const addProduct = async ({ file, name, price, isActive, stock }) => {
  const imageUrl = await uploadProductImage(file);

  const product = await ProductModel.create({
    name,
    price,
    isActive,
    imageUrl,
    stock,
  });

  return product;
};

const getProducts = async () => {
  const products = await ProductModel.find({ isActive: true });
  return products;
};

const updateProduct = async (id, updates) => {
  const product = await ProductModel.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { runValidators: true, new: true },
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
};

const checkStock = async (cartItems) => {
  if (cartItems.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  for (let item of cartItems) {
    if (item.quantity <= 0) {
      throw new AppError("Invalid quantity", 400);
    }

    const productSnap = await db.collection("products").doc(item.id).get();

    if (!productSnap.exists) {
      throw new AppError(`Product (${item.id}) not found`, 400);
    }

    const product = productSnap.data();

    if (product.stock < item.quantity) {
      throw new AppError(
        `Item (${item.id}) out of stock, available: ${product.stock}`,
        400,
      );
    }
  }

  return true;
};

/**
 * get all products
 */

const getProductsForAdmin = async () => {
  const products = await ProductModel.find({});
  return products;
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  checkStock,
  getProductsForAdmin,
};
