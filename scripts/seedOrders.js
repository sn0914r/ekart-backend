import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

import OrderModel from "#modules/order/OrderModel/order.model.js";
import UserModel from "#modules/auth/models/user.model.js";
import ProductModel from "#modules/product/product.model.js";

const ADDRESSES = [
  {
    address: "Sapthagiri Nagar",
    city: "Madanapalle",
    state: "Andhra Pradesh",
    pincode: "517325",
    phone: "+919876543210",
  },
  {
    address: "NGO Colony",
    city: "Kadapa",
    state: "Andhra Pradesh",
    pincode: "516001",
    phone: "+919876543211",
  },
  {
    address: "Brodipet",
    city: "Guntur",
    state: "Andhra Pradesh",
    pincode: "522002",
    phone: "+919876543212",
  },
  {
    address: "MVP Colony",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    pincode: "530017",
    phone: "+919876543213",
  },
  {
    address: "Auto Nagar",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    pincode: "520007",
    phone: "+919876543214",
  },
  {
    address: "Balaji Colony",
    city: "Tirupati",
    state: "Andhra Pradesh",
    pincode: "517501",
    phone: "+919876543215",
  },
];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDate = () => {
  const start = new Date("2024-01-01").getTime();
  const end = new Date().getTime();

  return new Date(start + Math.random() * (end - start));
};

function getRandomProducts(products) {
  const random = Math.random();

  let count = 1;

  if (random > 0.6) count = 2;
  if (random > 0.85) count = 3;
  if (random > 0.95) count = 4;

  count = Math.min(count, products.length);

  const selected = [...products]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  return selected;
}

function createOrder(type, users, products) {
  const user = randomItem(users);
  const address = randomItem(ADDRESSES);

  const selectedProducts = getRandomProducts(products);

  let subTotal = 0;

  const orderSnapshot = selectedProducts.map((product) => {
    const quantity = Math.floor(Math.random() * 3) + 1;
    const lineTotal = quantity * product.price;

    subTotal += lineTotal;

    return {
      productId: product._id,
      quantity,
      unitPrice: product.price,
      name: product.name,
      imageUrl:
        product.images && product.images.length > 0 ? product.images[0] : "",
      lineTotal,
    };
  });

  const createdAt = randomDate();

  let orderStatus = "CONFIRMED";
  let paymentStatus = "PAID";
  let shippingStatus = "DELIVERED";
  let isStockReverted = false;

  if (type === "SHIPPED") {
    shippingStatus = "SHIPPED";
  }

  if (type === "CONFIRMED") {
    shippingStatus = "PENDING";
  }

  if (type === "CANCELLED") {
    orderStatus = "CANCELLED";
    paymentStatus = "REFUND PENDING";
    shippingStatus = "CANCELLED";
    isStockReverted = true;
  }

  if (type === "REFUNDED") {
    orderStatus = "CANCELLED";
    paymentStatus = "REFUNDED";
    shippingStatus = "CANCELLED";
    isStockReverted = true;
  }

  return {
    currency: "INR",

    userId: user._id.toString(),
    email: user.email,

    orderSnapshot,

    subTotal,

    isStockReverted,

    orderStatus,
    paymentStatus,
    shippingStatus,

    paymentDetails: {
      poePaymentId: `poe_${crypto.randomUUID()}`,
      gateway: "razorpay",
      paymentMethod: "card",
      failureCode: null,
      failureReason: null,
      failureDescription: null,
    },

    orderStatusHistory: [
      {
        status: "CREATED",
        at: createdAt,
        by: user._id.toString(),
      },
      {
        status: orderStatus,
        at: new Date(createdAt.getTime() + 60000),
        by: user._id.toString(),
      },
    ],

    shippingStatusHistory: [
      {
        status: shippingStatus,
        at: new Date(createdAt.getTime() + 120000),
        by: user._id.toString(),
      },
    ],

    paymentStatusHistory: [
      {
        status: "PENDING",
        at: createdAt,
        by: user._id.toString(),
      },
      {
        status: paymentStatus,
        at: new Date(createdAt.getTime() + 30000),
        by: user._id.toString(),
      },
    ],

    shippingAddress: {
      name: user.name,
      address: address.address,
      city: address.city,
      state: address.state,
      country: "India",
      pincode: address.pincode,
      phone: address.phone,
    },

    createdAt,
    updatedAt: new Date(createdAt.getTime() + 180000),
  };
}

export async function seedOrders() {
  const users = await UserModel.find({
    role: { $nin: ["admin", "demo-admin"] },
  });
  if (users.length === 0) {
    console.warn(
      "No regular users found in DB! Please seed users before seeding orders.",
    );
    return;
  }

  const products = await ProductModel.find({});
  if (products.length === 0) {
    console.warn(
      "No products found in DB! Please seed products before seeding orders.",
    );
    return;
  }

  const orders = [
    ...Array.from({ length: 45 }, () =>
      createOrder("DELIVERED", users, products),
    ),
    ...Array.from({ length: 5 }, () => createOrder("SHIPPED", users, products)),
    ...Array.from({ length: 5 }, () =>
      createOrder("CONFIRMED", users, products),
    ),
    ...Array.from({ length: 3 }, () =>
      createOrder("CANCELLED", users, products),
    ),
    ...Array.from({ length: 2 }, () =>
      createOrder("REFUNDED", users, products),
    ),
  ];

  await OrderModel.deleteMany({});
  await OrderModel.create(orders);

  console.log(`Inserted ${orders.length} orders successfully.`);
}

if (process.argv[1] && process.argv[1].endsWith("seedOrders.js")) {
  dotenv.config();

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("Connected to MongoDB. Starting orders seeding...");
      await seedOrders();
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to seed orders:", err);
      process.exit(1);
    });
}
