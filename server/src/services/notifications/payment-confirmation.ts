import type { Types } from "mongoose";
import { env } from "../../config/env.js";
import { NotificationLog } from "../../models/NotificationLog.js";
import { WhatsAppMetaProvider } from "./providers/whatsapp-meta.js";
import { ConsoleProvider } from "./providers/console.js";
import type { NotificationProvider } from "./types.js";

interface PaymentConfirmationPayload {
  billId: Types.ObjectId;
  companyId: Types.ObjectId;
  companyName: string;
  phone: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: "CASH" | "CHEQUE" | "ONLINE";
  isFullyPaid: boolean;
}

function formatAmount(amount: number): string {
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
}

function getProvider(): NotificationProvider {
  if (env.NOTIFICATION_PROVIDER === "whatsapp_meta") {
    const meta = new WhatsAppMetaProvider();
    if (meta.isConfigured()) return meta;
  }
  return new ConsoleProvider();
}

/**
 * Sends a payment confirmation message to the company after admin records a payment.
 *
 * This is called fire-and-forget from the bill complete route so it doesn't
 * block the API response. Failures are logged but don't affect the user.
 */
export async function sendPaymentConfirmation(payload: PaymentConfirmationPayload): Promise<void> {
  const provider = getProvider();
  const remaining = payload.totalAmount - payload.paidAmount;

  // Build a human-readable confirmation message
  const message = payload.isFullyPaid
    ? `✅ Payment Confirmation\n\n` +
      `Dear ${payload.companyName},\n\n` +
      `We have received your full payment of ${formatAmount(payload.totalAmount)} ` +
      `for bill #${payload.invoiceNumber}.\n` +
      `Payment method: ${payload.paymentMethod}\n\n` +
      `Your bill is now marked as COMPLETED.\n\n` +
      `Thank you!\n- Bill Desk`
    : `💰 Payment Received\n\n` +
      `Dear ${payload.companyName},\n\n` +
      `We have received a partial payment of ${formatAmount(payload.paidAmount)} ` +
      `for bill #${payload.invoiceNumber}.\n` +
      `Payment method: ${payload.paymentMethod}\n` +
      `Remaining balance: ${formatAmount(remaining)}\n\n` +
      `Please arrange the remaining payment at the earliest.\n\n` +
      `Thank you!\n- Bill Desk`;

  // For the WhatsApp Meta provider, we use a different template for confirmations.
  // For console/dev, we just log the message directly.
  const result = await provider.send({
    billId: payload.billId,
    companyId: payload.companyId,
    companyName: payload.companyName,
    phone: payload.phone,
    invoiceNumber: payload.invoiceNumber,
    totalAmount: payload.totalAmount,
    paidAmount: payload.paidAmount,
    billDate: new Date(), // Not relevant for confirmation, use current date
    overdueDays: 0,
  });

  // Log the notification
  await NotificationLog.create({
    billId: payload.billId,
    companyId: payload.companyId,
    type: provider.type,
    phone: payload.phone,
    message: payload.isFullyPaid ? "Payment confirmation (full)" : "Payment confirmation (partial)",
    status: result.success ? "sent" : "failed",
    error: result.error,
    messageId: result.messageId,
  });

  if (result.success) {
    console.log(
      `✅ Payment confirmation sent to ${payload.phone} for bill #${payload.invoiceNumber} (${payload.isFullyPaid ? "full" : "partial"})`
    );
  } else {
    console.error(
      `❌ Payment confirmation failed for ${payload.phone}: ${result.error}`
    );
  }
}
