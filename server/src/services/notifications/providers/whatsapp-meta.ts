import { env } from "../../../config/env.js";
import type { NotificationPayload, NotificationProvider, NotificationResult } from "../types.js";

/**
 * Meta WhatsApp Business Cloud API Provider.
 *
 * Free tier: 1,000 service conversations/month.
 * Uses template messages (required by WhatsApp for business-initiated messages).
 *
 * Two templates are used:
 * - "overdue_reminder" (with discount) — 8 parameters
 * - "overdue_reminder_no_discount" (without discount) — 7 parameters (no discount param)
 *
 * Template with discount ({{1}}-{{8}}):
 *   {{1}} = Invoice number
 *   {{2}} = Total bill amount
 *   {{3}} = Paid amount
 *   {{4}} = Last payment date
 *   {{5}} = Remaining amount
 *   {{6}} = Discount amount
 *   {{7}} = Total pending bills count
 *   {{8}} = Total outstanding amount
 *
 * Template without discount ({{1}}-{{7}}):
 *   {{1}} = Invoice number
 *   {{2}} = Total bill amount
 *   {{3}} = Paid amount
 *   {{4}} = Last payment date
 *   {{5}} = Remaining amount
 *   {{6}} = Total pending bills count
 *   {{7}} = Total outstanding amount
 */
export class WhatsAppMetaProvider implements NotificationProvider {
  readonly name = "WhatsApp (Meta Cloud API)";
  readonly type = "whatsapp" as const;

  private readonly apiUrl: string;
  private readonly token: string;

  constructor() {
    this.apiUrl = `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    this.token = env.WHATSAPP_API_TOKEN;
  }

  isConfigured(): boolean {
    return !!(env.WHATSAPP_API_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID);
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "WhatsApp Meta API not configured" };
    }

    // Only send WhatsApp messages to the allowed number
    const ALLOWED_WHATSAPP_NUMBER = "6354906794";
    const cleanedPhone = payload.phone.replace(/\D/g, "");
    if (cleanedPhone !== ALLOWED_WHATSAPP_NUMBER && !cleanedPhone.endsWith(ALLOWED_WHATSAPP_NUMBER)) {
      console.log(`⏭️  Skipping WhatsApp message for ${payload.phone} — only ${ALLOWED_WHATSAPP_NUMBER} is allowed.`);
      return { success: true, messageId: "skipped-not-allowed-number" };
    }

    const phone = this.formatPhone(payload.phone);
    const remaining = payload.totalAmount - payload.paidAmount - payload.discount;

    // Format last payment date in DD/MM/YYYY format
    const lastPaymentDateStr = payload.lastPaymentDate
      ? new Date(payload.lastPaymentDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "N/A";

    // Choose template and parameters based on whether discount exists
    const hasDiscount = payload.discount > 0;
    const templateName = hasDiscount
      ? env.WHATSAPP_TEMPLATE_NAME
      : env.WHATSAPP_TEMPLATE_NAME_NO_DISCOUNT;

    const parameters = hasDiscount
      ? [
          { type: "text", text: payload.invoiceNumber },                            // {{1}} - Invoice number
          { type: "text", text: this.formatAmount(payload.totalAmount) },            // {{2}} - Total bill amount
          { type: "text", text: this.formatAmount(payload.paidAmount) },             // {{3}} - Paid amount
          { type: "text", text: lastPaymentDateStr },                               // {{4}} - Last payment date
          { type: "text", text: this.formatAmount(remaining) },                     // {{5}} - Remaining amount
          { type: "text", text: this.formatAmount(payload.discount) },              // {{6}} - Discount amount
          { type: "text", text: String(payload.totalPendingBills) },                // {{7}} - Total pending bills count
          { type: "text", text: this.formatAmount(payload.totalOutstandingAmount) }, // {{8}} - Total outstanding
        ]
      : [
          { type: "text", text: payload.invoiceNumber },                            // {{1}} - Invoice number
          { type: "text", text: this.formatAmount(payload.totalAmount) },            // {{2}} - Total bill amount
          { type: "text", text: this.formatAmount(payload.paidAmount) },             // {{3}} - Paid amount
          { type: "text", text: lastPaymentDateStr },                               // {{4}} - Last payment date
          { type: "text", text: this.formatAmount(remaining) },                     // {{5}} - Remaining amount
          { type: "text", text: String(payload.totalPendingBills) },                // {{6}} - Total pending bills count
          { type: "text", text: this.formatAmount(payload.totalOutstandingAmount) }, // {{7}} - Total outstanding
        ];

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "gu" },
            components: [
              {
                type: "body",
                parameters,
              },
            ],
          },
        }),
      });

      const data = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        const error = (data as { error?: { message?: string } }).error;
        return {
          success: false,
          error: error?.message || `HTTP ${response.status}`,
        };
      }

      const messages = (data as { messages?: Array<{ id: string }> }).messages;
      return {
        success: true,
        messageId: messages?.[0]?.id,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: msg };
    }
  }

  /**
   * Format Indian phone number to international format.
   * Accepts: "9876543210" → "919876543210"
   */
  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("91") && cleaned.length === 12) return cleaned;
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
  }

  private formatAmount(amount: number): string {
    return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
  }
}
