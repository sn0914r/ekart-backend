const { bucket, admin, db } = require("../configs/firebase.config");
const {
  createDoc,
  getDoc,
  getDocs,
  updateDoc,
  getDocsByList,
} = require("../db/db.helpers");
const { getActiveProducts } = require("../db/product.db");
const AppError = require("../errors/AppError");
const generateRandomString = require("../utils/randomStringGenerator");

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

  const productId = await createDoc("products", {
    name,
    price,
    isActive,
    imageUrl,
    stock,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const product = await getDoc("products", productId);
  return product;
};

const getProducts = async () => {
  const products = await getActiveProducts();
  return products;
};

const updateProduct = async (id, updates) => {
  await updateDoc("products", id, {
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const product = await getDoc("products", id);
  return product;
};

const checkStock = async (cartItems) => {
  if (cartItems.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  for (item of cartItems) {
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
        400
      );
    }
  }

  return true;
};

module.exports = { addProduct, getProducts, updateProduct, checkStock };
