import { env } from "../../../config/env.js";
import type { NotificationPayload, NotificationProvider, NotificationResult } from "../types.js";

/**
 * Meta WhatsApp Business Cloud API Provider.
 *
 * Free tier: 1,000 service conversations/month.
 * Uses template messages (required by WhatsApp for business-initiated messages).
 *
 * Setup:
 * 1. Create a Meta Business Account at business.facebook.com
 * 2. Set up WhatsApp Business API at developers.facebook.com
 * 3. Create a message template named "overdue_reminder" with parameters:
 *    - {{1}} = company name
 *    - {{2}} = invoice number
 *    - {{3}} = total amount
 *    - {{4}} = outstanding amount
 *    - {{5}} = overdue days
 * 4. Get your Phone Number ID and API token from the dashboard
 */
export class WhatsAppMetaProvider implements NotificationProvider {
  readonly name = "WhatsApp (Meta Cloud API)";
  readonly type = "whatsapp" as const;

  private readonly apiUrl: string;
  private readonly token: string;
  private readonly templateName: string;

  constructor() {
    this.apiUrl = `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    this.token = env.WHATSAPP_API_TOKEN;
    this.templateName = env.WHATSAPP_TEMPLATE_NAME;
  }

  isConfigured(): boolean {
    return !!(env.WHATSAPP_API_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID);
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "WhatsApp Meta API not configured" };
    }

    const phone = this.formatPhone(payload.phone);
    const remaining = payload.totalAmount - payload.paidAmount;

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
            name: this.templateName,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: payload.companyName },
                  { type: "text", text: this.formatAmount(payload.paidAmount || payload.totalAmount) },
                  { type: "text", text: payload.invoiceNumber },
                  { type: "text", text: String(payload.overdueDays || "CASH") },
                  { type: "text", text: this.formatAmount(remaining) },
                ],
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
