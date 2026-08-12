import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

async function createAdmin() {
  console.log("👤 Creating admin user...\n");

  await mongoose.connect(env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const email = "dharmik@gmail.com";

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`⚠️  User with email ${email} already exists. Skipping.`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash("Vaishvi@05", 10);

  const admin = await User.create({
    name: "Dharmik Darji",
    email,
    password: hashedPassword,
    role: "ADMIN",
  });

  console.log(`✅ Admin user created:`);
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}\n`);

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
