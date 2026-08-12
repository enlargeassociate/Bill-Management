import type { NotificationPayload, NotificationProvider, NotificationResult } from "../types.js";

/**
 * Console Provider — logs notifications to stdout.
 * Use this for development/testing without needing real API credentials.
 */
export class ConsoleProvider implements NotificationProvider {
  readonly name = "Console (Dev/Testing)";
  readonly type = "whatsapp" as const;

  isConfigured(): boolean {
    return true; // Always available
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const remaining = payload.totalAmount - payload.paidAmount;

    console.log("\n" + "═".repeat(60));
    console.log("📱 NOTIFICATION (Console Provider - Dev Mode)");
    console.log("═".repeat(60));
    console.log(`To:          +91${payload.phone} (${payload.companyName})`);
    console.log(`Bill:        #${payload.invoiceNumber}`);
    console.log(`Total:       ₹${payload.totalAmount.toLocaleString("en-IN")}`);
    console.log(`Outstanding: ₹${remaining.toLocaleString("en-IN")}`);
    console.log(`Overdue by:  ${payload.overdueDays} days`);
    console.log("═".repeat(60) + "\n");

    return { success: true, messageId: `console_${Date.now()}` };
  }
}
