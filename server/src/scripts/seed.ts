import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";
import { Bill } from "../models/Bill.js";

async function seed() {
  console.log("🌱 Seeding database...\n");

  await mongoose.connect(env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  // Clear existing data
  await Promise.all([User.deleteMany({}), Company.deleteMany({}), Bill.deleteMany({})]);
  console.log("🗑️  Cleared existing data\n");

  // Create users
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedViewer = await bcrypt.hash("viewer123", 10);

  const [admin, viewer] = await User.create([
    { name: "Anand Mehta", username: "admin", password: hashedAdmin, role: "ADMIN" },
    { name: "Riya Shah", username: "viewer", password: hashedViewer, role: "VIEWER" },
  ]);
  console.log(`👤 Created users: ${admin.username} (ADMIN), ${viewer.username} (VIEWER)\n`);

  // Create companies
  const companiesData = [
    { name: "ABC Technologies Pvt Ltd", phone: "9876543210" },
    { name: "Shree Enterprises", phone: "9825011223" },
    { name: "Patel Industries", phone: "9812345678" },
    { name: "Nova Infotech", phone: "9900112233" },
    { name: "Global Traders", phone: "9765432109" },
    { name: "Darji Solutions", phone: "9723456789" },
  ];

  const companies = await Company.create(companiesData);
  console.log(`🏢 Created ${companies.length} companies\n`);

  // Create bills
  const day = (offset: number) => {
    const d = new Date();
    d.setHours(10, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d;
  };

  type Seed = [number, string, number, number, number, ("CASH" | "CHEQUE" | "ONLINE")?];
  const seeds: Seed[] = [
    [0, "INV-5001", 75000, -40, -35],
    [0, "INV-5002", 120000, -75, -70, "ONLINE"],
    [0, "INV-5003", 25000, -18, -15],
    [0, "INV-5004", 250000, -110, -105, "CHEQUE"],
    [1, "INV-5005", 48500, -30, -25],
    [1, "INV-5006", 12500, -22, -20],
    [1, "INV-5007", 18500, -60, -55, "CASH"],
    [1, "INV-5008", 90000, -50, -45, "ONLINE"],
    [2, "INV-5009", 145000, -35, -30],
    [2, "INV-5010", 62000, -28, -25],
    [2, "INV-5011", 210000, -95, -90, "CHEQUE"],
    [2, "INV-5012", 34500, -12, -10],
    [3, "INV-5013", 185000, -44, -40],
    [3, "INV-5014", 55000, -20, -15],
    [3, "INV-5015", 98000, -70, -65, "ONLINE"],
    [3, "INV-5016", 27500, -15, -12],
    [4, "INV-5017", 320000, -55, -50],
    [4, "INV-5018", 148000, -80, -75, "CASH"],
    [4, "INV-5019", 42000, -26, -22],
    [4, "INV-5020", 275000, -100, -95, "ONLINE"],
    [5, "INV-5021", 165000, -33, -28],
    [5, "INV-5022", 58500, -19, -15],
    [5, "INV-5023", 240000, -88, -83, "CHEQUE"],
    [5, "INV-5024", 32000, -10, -7],
    [5, "INV-5025", 415000, -120, -115, "ONLINE"],
  ];

  const billDocs = seeds.map(([companyIdx, invoiceNumber, totalAmount, created, billDateOffset, pm]) => ({
    companyId: companies[companyIdx]._id,
    invoiceNumber,
    totalAmount,
    billDate: day(billDateOffset),
    createdAt: day(created),
    status: pm ? "COMPLETED" : "PENDING",
    paymentMethod: pm || undefined,
    paidAmount: pm ? totalAmount : 0,
    completedAt: pm ? day(billDateOffset + 5) : undefined,
  }));

  const bills = await Bill.insertMany(billDocs);
  console.log(`📄 Created ${bills.length} bills\n`);

  console.log("✅ Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Admin: admin@example.com / admin123");
  console.log("  Viewer: viewer@example.com / viewer123\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
