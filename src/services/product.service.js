const { bucket } = require("../configs/firebase.config");
const { createDoc, getDoc, getDocs } = require("../db/db.helpers");
const { getActiveProducts } = require("../db/product.db");
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

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  return publicUrl;
};

const addProduct = async ({ file, name, price, isActive }) => {
  const timestamp = new Date();
  const imageUrl = await uploadProductImage(file);
  const productId = await createDoc("products", {
    name,
    price,
    isActive,
    imageUrl,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const product = await getDoc(productId);
  return product;
};

const getProducts = async () => {
  const products = await getActiveProducts();
  return products;
};
module.exports = { addProduct, getProducts };
