import cron from "node-cron";
import { Bill } from "../models/Bill.js";
import { Company } from "../models/Company.js";
import { env } from "../config/env.js";
import { notificationService, type NotificationPayload } from "./notifications/index.js";
import type { Types } from "mongoose";

/**
 * Overdue Bill Cron Service
 *
 * Best practices:
 * 1. Atomic status updates — uses findOneAndUpdate to prevent race conditions
 * 2. Batch processing — collects all overdue bills before sending notifications
 * 3. Idempotent — safe to run multiple times (won't re-notify recently notified)
 * 4. Error isolation — one bill's failure doesn't block others
 * 5. Configurable schedule and threshold via env vars
 */

/**
 * Step 1: Find PENDING bills past the overdue threshold and mark them OVERDUE.
 * Returns the newly marked overdue bills.
 */
async function markOverdueBills(): Promise<number> {
  const overdueThreshold = new Date();
  overdueThreshold.setDate(overdueThreshold.getDate() - env.OVERDUE_DAYS);

  const result = await Bill.updateMany(
    {
      status: "PENDING",
      billDate: { $lt: overdueThreshold },
    },
    { $set: { status: "OVERDUE" } }
  );

  return result.modifiedCount;
}

/**
 * Step 2: Find all OVERDUE bills that need notification
 * (not notified in the last 24 hours).
 */
async function getUnnotifiedOverdueBills() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return Bill.find({
    status: "OVERDUE",
    $or: [
      { overdueNotifiedAt: { $lt: oneDayAgo } },
      { overdueNotifiedAt: { $exists: false } },
      { overdueNotifiedAt: null },
    ],
  }).lean();
}

/**
 * Step 3: Build notification payloads and send them.
 */
async function sendNotifications() {
  const bills = await getUnnotifiedOverdueBills();

  if (bills.length === 0) {
    console.log("  ✅ No notifications to send.");
    return;
  }

  console.log(`  📨 Sending notifications for ${bills.length} overdue bill(s)...`);

  // Group bills by company to fetch company data efficiently
  const companyIds = [...new Set(bills.map((b) => b.companyId.toString()))];
  const companies = await Company.find({ _id: { $in: companyIds } }).lean();
  const companyMap = new Map(companies.map((c) => [c._id.toString(), c]));

  // Build payloads
  const payloads: NotificationPayload[] = [];

  for (const bill of bills) {
    const company = companyMap.get(bill.companyId.toString());
    if (!company) {
      console.warn(`  ⚠️  Company not found for bill ${bill.invoiceNumber}, skipping.`);
      continue;
    }

    const overdueDays = Math.floor(
      (Date.now() - new Date(bill.billDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    payloads.push({
      billId: bill._id as Types.ObjectId,
      companyId: company._id as Types.ObjectId,
      companyName: company.name,
      phone: company.phone,
      invoiceNumber: bill.invoiceNumber,
      totalAmount: bill.totalAmount,
      paidAmount: bill.paidAmount,
      billDate: new Date(bill.billDate),
      overdueDays,
    });
  }

  // Send batch
  const results = await notificationService.sendBatch(payloads);

  // Mark bills as notified
  let sent = 0;
  let failed = 0;

  for (const [billId, result] of results) {
    if (result.success) {
      await Bill.findByIdAndUpdate(billId, { overdueNotifiedAt: new Date() });
      sent++;
    } else {
      failed++;
    }
  }

  console.log(`  ✅ Notifications: ${sent} sent, ${failed} failed.`);
}

/**
 * Main cron handler — runs the full overdue check cycle.
 */
async function runOverdueCheck() {
  const startTime = Date.now();
  console.log(`\n${"─".repeat(50)}`);
  console.log(`⏰ Overdue Check — ${new Date().toISOString()}`);
  console.log(`${"─".repeat(50)}`);

  try {
    // Step 1: Mark overdue
    const markedCount = await markOverdueBills();
    if (markedCount > 0) {
      console.log(`  🔴 Marked ${markedCount} bill(s) as OVERDUE.`);
    } else {
      console.log("  ✅ No new overdue bills.");
    }

    // Step 2 & 3: Notify
    await sendNotifications();
  } catch (error) {
    console.error("  ❌ Overdue check failed:", error);
  }

  const duration = Date.now() - startTime;
  console.log(`  ⏱️  Completed in ${duration}ms`);
  console.log(`${"─".repeat(50)}\n`);
}

/**
 * Start the cron scheduler.
 */
export function startOverdueCron() {
  const schedule = env.OVERDUE_CRON_SCHEDULE;

  console.log(`\n🕐 Cron Configuration:`);
  console.log(`   Schedule:  "${schedule}"`);
  console.log(`   Threshold: ${env.OVERDUE_DAYS} days`);
  console.log(`   Provider:  ${env.NOTIFICATION_PROVIDER}`);
  console.log(`   Retries:   ${env.NOTIFICATION_MAX_RETRIES}\n`);

  // Validate cron expression
  if (!cron.validate(schedule)) {
    console.error(`❌ Invalid cron schedule: "${schedule}"`);
    return;
  }

  // Schedule the job
  cron.schedule(schedule, runOverdueCheck, {
    timezone: "Asia/Kolkata",
  });

  // Run once on startup (after 5 second delay to let DB stabilize)
  setTimeout(() => {
    console.log("🔍 Running initial overdue check...");
    runOverdueCheck();
  }, 5000);
}
