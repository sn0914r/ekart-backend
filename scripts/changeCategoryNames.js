import mongoose from "mongoose";
import dotenv from "dotenv";
import ProductModel from "#modules/product/product.model.js";
import { PRODUCT } from "#constants/index.js";

dotenv.config();

const CATEGORY_MAPPINGS = [
  {
    name: "shirts -> topwear",
    filter: { category: { $regex: /^shirts?$/i } },
    newCategory: PRODUCT.CATEGORIES.TOPWEAR,
  },
  {
    name: "pants -> bottomwear",
    filter: { category: { $regex: /^pants?$/i } },
    newCategory: PRODUCT.CATEGORIES.BOTTOMWEAR,
  },
  {
    name: "shoes -> footwear",
    filter: { category: { $regex: /^shoes?$/i } },
    newCategory: PRODUCT.CATEGORIES.FOOTWEAR,
  },
];

async function updateCategories() {
  console.log("Fetching current categories in database...");
  const categoriesBefore = await ProductModel.distinct("category");
  console.log("Current categories:", categoriesBefore);

  let totalModified = 0;

  for (const mapping of CATEGORY_MAPPINGS) {
    const result = await ProductModel.updateMany(mapping.filter, {
      $set: { category: mapping.newCategory },
    });

    console.log(
      `✓ [${mapping.name}]: matched ${result.matchedCount}, modified ${result.modifiedCount} product(s).`,
    );
    totalModified += result.modifiedCount;
  }

  console.log(`\nCategory migration complete! Total products updated: ${totalModified}`);

  const categoriesAfter = await ProductModel.distinct("category");
  console.log("Categories after update:", categoriesAfter);

  // Attempt to invalidate Redis cache if Redis is reachable
  if (process.env.REDIS_URL) {
    try {
      const Redis = (await import("ioredis")).default;
      const redis = new Redis(process.env.REDIS_URL, {
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });

      await redis.connect();
      const keys = await redis.keys("products:*");
      if (keys.length > 0) {
        await redis.del(keys);
        console.log(`Cleared ${keys.length} product cache key(s) from Redis.`);
      } else {
        console.log("No product cache keys found in Redis to clear.");
      }
      redis.disconnect();
    } catch {
      console.log(
        "Notice: Redis is currently unreachable. Make sure to restart or clear the Redis cache once Redis is running.",
      );
    }
  }
}

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully.\n");
    await updateCategories();
    await mongoose.disconnect();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to update categories:", err);
    process.exit(1);
  });
