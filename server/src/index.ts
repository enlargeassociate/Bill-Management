import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { startOverdueCron } from "./services/overdueCron.js";

// Routes
import authRoutes from "./routes/auth.js";
import companyRoutes from "./routes/companies.js";
import billRoutes from "./routes/bills.js";
import notificationRoutes from "./routes/notifications.js";

const app = express();

// Middleware
app.use(cors({
  origin: env.NODE_ENV === "production"
    ? (process.env.FRONTEND_URL || "http://localhost:5173")
    : ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/notifications", notificationRoutes);

// Start server
async function start() {
  await connectDB();

  // Start the overdue cron job
  startOverdueCron();

  app.listen(env.PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`   Health: http://localhost:${env.PORT}/api/health\n`);
  });
}

start();
