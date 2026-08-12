import { env } from "../../config/env.js";
import { NotificationLog } from "../../models/NotificationLog.js";
import type { NotificationPayload, NotificationProvider, NotificationResult } from "./types.js";
import { WhatsAppMetaProvider } from "./providers/whatsapp-meta.js";
import { ConsoleProvider } from "./providers/console.js";

export type { NotificationPayload, NotificationResult };

/**
 * Notification Service
 *
 * Best practices implemented:
 * 1. Provider pattern — easily swap providers without changing business logic
 * 2. Retry with exponential backoff — handles transient failures
 * 3. Logging — every attempt is recorded in NotificationLog collection
 * 4. Rate limiting awareness — respects API limits
 * 5. Graceful fallback — falls back to console in dev mode
 */
class NotificationService {
  private provider: NotificationProvider;

  constructor() {
    this.provider = this.resolveProvider();
    console.log(`📨 Notification provider: ${this.provider.name}`);
  }

  private resolveProvider(): NotificationProvider {
    switch (env.NOTIFICATION_PROVIDER) {
      case "whatsapp_meta": {
        const meta = new WhatsAppMetaProvider();
        if (meta.isConfigured()) return meta;
        console.warn("⚠️  WhatsApp Meta not configured, falling back to Console provider");
        return new ConsoleProvider();
      }
      case "console":
      default:
        return new ConsoleProvider();
    }
  }

  /**
   * Send a notification with retry logic.
   */
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const maxRetries = env.NOTIFICATION_MAX_RETRIES;
    let lastError = "";

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.provider.send(payload);

      // Log every attempt
      await this.logAttempt(payload, result, attempt);

      if (result.success) {
        return result;
      }

      lastError = result.error || "Unknown error";

      // Don't retry on certain errors (invalid number, template not found, etc.)
      if (this.isNonRetryableError(lastError)) {
        console.error(`❌ Non-retryable error for ${payload.phone}: ${lastError}`);
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = env.NOTIFICATION_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `⚠️  Attempt ${attempt}/${maxRetries} failed for ${payload.phone}. Retrying in ${delay}ms...`
        );
        await this.sleep(delay);
      }
    }

    return { success: false, error: lastError };
  }

  /**
   * Send notifications to multiple payloads with rate limiting.
   * Processes sequentially with a small delay to avoid hitting API rate limits.
   */
  async sendBatch(payloads: NotificationPayload[]): Promise<Map<string, NotificationResult>> {
    const results = new Map<string, NotificationResult>();

    for (const payload of payloads) {
      const result = await this.send(payload);
      results.set(payload.billId.toString(), result);

      // Small delay between messages to respect rate limits (WhatsApp: 80 msg/sec)
      if (payloads.length > 1) {
        await this.sleep(200);
      }
    }

    return results;
  }

  private async logAttempt(
    payload: NotificationPayload,
    result: NotificationResult,
    attempt: number
  ): Promise<void> {
    try {
      await NotificationLog.create({
        billId: payload.billId,
        companyId: payload.companyId,
        type: this.provider.type,
        phone: payload.phone,
        message: `[Attempt ${attempt}] Bill #${payload.invoiceNumber} overdue by ${payload.overdueDays} days`,
        status: result.success ? "sent" : "failed",
        error: result.error,
        messageId: result.messageId,
      });
    } catch (error) {
      // Don't let logging failure break the notification flow
      console.error("Failed to log notification:", error);
    }
  }

  private isNonRetryableError(error: string): boolean {
    const nonRetryable = [
      "invalid phone",
      "not a valid whatsapp",
      "template not found",
      "parameter mismatch",
      "authentication",
      "unauthorized",
      "permission",
    ];
    const lower = error.toLowerCase();
    return nonRetryable.some((keyword) => lower.includes(keyword));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const notificationService = new NotificationService();
