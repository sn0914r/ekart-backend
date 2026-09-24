import mongoose from "mongoose";
import dotenv from "dotenv";
import UserModel from "#modules/auth/models/user.model.js";

dotenv.config();

async function addDefaultUserFlags() {
  console.log("Checking users in database...");

  const totalUsers = await UserModel.countDocuments();
  console.log(`Total users in database: ${totalUsers}`);

  if (totalUsers === 0) {
    console.log("No users found to update.");
    return;
  }

  // Count users missing isActive or isDeleted
  const missingIsActive = await UserModel.countDocuments({
    isActive: { $exists: false },
  });
  const missingIsDeleted = await UserModel.countDocuments({
    isDeleted: { $exists: false },
  });

  console.log(`Users missing 'isActive': ${missingIsActive}`);
  console.log(`Users missing 'isDeleted': ${missingIsDeleted}`);

  const updateResult = await UserModel.updateMany(
    {
      $or: [
        { isActive: { $exists: false } },
        { isActive: null },
        { isDeleted: { $exists: false } },
        { isDeleted: null },
      ],
    },
    {
      $set: {
        isActive: true,
        isDeleted: false,
        deletedAt: null,
      },
    },
  );

  console.log(
    `\n✓ Matched: ${updateResult.matchedCount} user(s), Modified: ${updateResult.modifiedCount} user(s).`,
  );

  // Verification summary
  const activeCount = await UserModel.countDocuments({ isActive: true, isDeleted: false });
  const inactiveCount = await UserModel.countDocuments({ isActive: false, isDeleted: false });
  const deletedCount = await UserModel.countDocuments({ isDeleted: true });

  console.log("\n--- Current Users Breakdown ---");
  console.log(`Active & Not Deleted: ${activeCount}`);
  console.log(`Inactive:             ${inactiveCount}`);
  console.log(`Soft Deleted:         ${deletedCount}`);
  console.log("-------------------------------\n");
}

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully.\n");
    await addDefaultUserFlags();
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
