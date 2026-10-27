import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

import OrderModel from "#db/models/order.model.js";
import UserModel from "#db/models/user.model.js";
import ProductModel from "#db/models/product.model.js";
import { ORDER } from "#constants/index.js";

dotenv.config();

const { ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS } = ORDER;

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

/**
 * Number and distribution of mock orders across various lifecycle stages.
 */
const ORDER_DISTRIBUTION = [
  { type: "DELIVERED", count: 45 },
  { type: "SHIPPED", count: 5 },
  { type: "CONFIRMED", count: 5 },
  { type: "CANCELLED", count: 3 },
  { type: "REFUNDED", count: 2 },
];

/**
 * Status mapping table defining order, payment, and shipping flags per order type.
 */
const ORDER_STATUS_CONFIGS = {
  DELIVERED: {
    orderStatus: ORDER_STATUS.CONFIRMED,
    paymentStatus: PAYMENT_STATUS.PAID,
    shippingStatus: SHIPPING_STATUS.DELIVERED,
    isStockReverted: false,
  },
  SHIPPED: {
    orderStatus: ORDER_STATUS.CONFIRMED,
    paymentStatus: PAYMENT_STATUS.PAID,
    shippingStatus: SHIPPING_STATUS.SHIPPED,
    isStockReverted: false,
  },
  CONFIRMED: {
    orderStatus: ORDER_STATUS.CONFIRMED,
    paymentStatus: PAYMENT_STATUS.PAID,
    shippingStatus: SHIPPING_STATUS.PENDING,
    isStockReverted: false,
  },
  CANCELLED: {
    orderStatus: ORDER_STATUS.CANCELLED,
    paymentStatus: PAYMENT_STATUS.REFUND_PENDING,
    shippingStatus: SHIPPING_STATUS.CANCELLED,
    isStockReverted: true,
  },
  REFUNDED: {
    orderStatus: ORDER_STATUS.CANCELLED,
    paymentStatus: PAYMENT_STATUS.REFUNDED,
    shippingStatus: SHIPPING_STATUS.CANCELLED,
    isStockReverted: true,
  },
};

/**
 * Select a random element from an array.
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate a random date between January 1, 2024 and now.
 * @returns {Date}
 */
const getRandomDate = () => {
  const start = new Date("2024-01-01").getTime();
  const end = new Date().getTime();
  return new Date(start + Math.random() * (end - start));
};

/**
 * Select between 1 and 3 random products from the available pool.
 * @param {Array<Object>} products
 * @returns {Array<Object>}
 */
function selectRandomProducts(products) {
  const count = Math.min(Math.floor(Math.random() * 3) + 1, products.length);
  return [...products].sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Build line items and subtotal for an order snapshot.
 * @param {Array<Object>} products
 * @returns {{snapshot: Array<Object>, subTotal: number}}
 */
function buildOrderSnapshot(products) {
  const selectedProducts = selectRandomProducts(products);

  let subTotal = 0;
  const snapshot = selectedProducts.map((product) => {
    const quantity = Math.floor(Math.random() * 3) + 1;
    const lineTotal = quantity * product.price;
    subTotal += lineTotal;

    return {
      productId: product._id,
      quantity,
      unitPrice: product.price,
      name: product.name,
      imageUrl: product.images?.[0] || "",
      lineTotal,
    };
  });

  return { snapshot, subTotal };
}

/**
 * Build realistic timeline histories for order, payment, and shipping.
 * @param {string} userId
 * @param {Date} createdAt
 * @param {string} orderStatus
 * @param {string} paymentStatus
 * @param {string} shippingStatus
 * @returns {{
 *   orderStatusHistory: Array<Object>,
 *   shippingStatusHistory: Array<Object>,
 *   paymentStatusHistory: Array<Object>
 * }}
 */
function buildStatusHistories(
  userId,
  createdAt,
  orderStatus,
  paymentStatus,
  shippingStatus,
) {
  const createdAtMs = createdAt.getTime();

  return {
    orderStatusHistory: [
      { status: "CREATED", at: createdAt, by: userId },
      { status: orderStatus, at: new Date(createdAtMs + 60000), by: userId },
    ],
    shippingStatusHistory: [
      {
        status: shippingStatus,
        at: new Date(createdAtMs + 120000),
        by: userId,
      },
    ],
    paymentStatusHistory: [
      { status: "PENDING", at: createdAt, by: userId },
      { status: paymentStatus, at: new Date(createdAtMs + 30000), by: userId },
    ],
  };
}

/**
 * Create a single complete mock order document object.
 * @param {string} type - Key in ORDER_STATUS_CONFIGS
 * @param {Array<Object>} users - Pool of regular users
 * @param {Array<Object>} products - Pool of products
 * @returns {Object} Plain order object ready for DB insertion
 */
function createSingleMockOrder(type, users, products) {
  const user = getRandomItem(users);
  const address = getRandomItem(ADDRESSES);
  const config = ORDER_STATUS_CONFIGS[type];
  const createdAt = getRandomDate();
  const userId = user._id.toString();

  const { snapshot, subTotal } = buildOrderSnapshot(products);
  const histories = buildStatusHistories(
    userId,
    createdAt,
    config.orderStatus,
    config.paymentStatus,
    config.shippingStatus,
  );

  return {
    currency: "INR",
    userId,
    email: user.email,
    orderSnapshot: snapshot,
    subTotal,
    isStockReverted: config.isStockReverted,
    orderStatus: config.orderStatus,
    paymentStatus: config.paymentStatus,
    shippingStatus: config.shippingStatus,
    paymentDetails: {
      poePaymentId: `poe_${crypto.randomUUID()}`,
      gateway: "razorpay",
      paymentMethod: "card",
      failureCode: null,
      failureReason: null,
      failureDescription: null,
    },
    ...histories,
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

/**
 * Seed database with mock orders matching distribution configuration.
 * @returns {Promise<number>} Number of seeded orders
 */
async function seedOrders() {
  console.log("Fetching regular users...");
  const users = await UserModel.find({
    role: { $nin: ["admin", "demo-admin"] },
  });

  if (users.length === 0) {
    console.warn(
      "⚠ No regular users found in DB! Please seed users before seeding orders.",
    );
    return 0;
  }
  console.log(`✓ Found ${users.length} eligible user(s).`);

  console.log("Fetching products...");
  const products = await ProductModel.find({});
  if (products.length === 0) {
    console.warn(
      "⚠ No products found in DB! Please seed products before seeding orders.",
    );
    return 0;
  }
  console.log(`✓ Found ${products.length} eligible product(s).`);

  console.log("\nGenerating mock orders based on distribution plan...");
  const orders = [];
  for (const { type, count } of ORDER_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      orders.push(createSingleMockOrder(type, users, products));
    }
    console.log(`  - Generated ${count} [${type}] orders`);
  }

  console.log(`\nClearing existing orders collection...`);
  await OrderModel.deleteMany({});

  console.log(`Inserting ${orders.length} orders into database...`);
  await OrderModel.create(orders);

  console.log(`✓ Inserted ${orders.length} mock orders successfully.`);
  return orders.length;
}

/**
 * Main execution runner for order seeder.
 */
async function runSeeder() {
  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully.\n");

    await seedOrders();

    await mongoose.disconnect();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed orders:", err);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith("seedOrders.js")) {
  runSeeder();
}

export {
  selectRandomProducts,
  buildOrderSnapshot,
  buildStatusHistories,
  createSingleMockOrder,
  seedOrders,
  runSeeder,
};
