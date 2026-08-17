import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

const users = [
  { name: "Enlarge Associate", username: "enlarge31", password: "Jaygurudeo@9#", role: "ADMIN" as const },
  { name: "Sahil", username: "sahil31", password: "sahil@9#", role: "VIEWER" as const },
  { name: "Kiran", username: "kiran31", password: "kiran@9#", role: "VIEWER" as const },
  { name: "Satish", username: "satish31", password: "satish@9#", role: "VIEWER" as const },
];

async function createUsers() {
  console.log("👤 Creating users...\n");

  await mongoose.connect(env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  // Drop legacy email index if it exists (model now uses username)
  try {
    await User.collection.dropIndex("email_1");
    console.log("🗑️  Dropped legacy email_1 index\n");
  } catch {
    // Index doesn't exist, that's fine
  }

  for (const u of users) {
    const existing = await User.findOne({ username: u.username });
    if (existing) {
      // Update password and role for existing user
      existing.password = await bcrypt.hash(u.password, 10);
      existing.role = u.role;
      existing.name = u.name;
      await existing.save();
      console.log(`🔄 Updated: ${u.username} (${u.role})`);
    } else {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await User.create({
        name: u.name,
        username: u.username,
        password: hashedPassword,
        role: u.role,
      });
      console.log(`✅ Created: ${u.username} (${u.role})`);
    }
  }

  console.log("\n✅ All users ready.\n");
  await mongoose.disconnect();
}

createUsers().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
