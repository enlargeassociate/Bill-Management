import type { Types } from "mongoose";

/**
 * Payload for sending an overdue notification.
 * Provider-agnostic — any provider must be able to send using this data.
 */
export interface NotificationPayload {
  billId: Types.ObjectId;
  companyId: Types.ObjectId;
  companyName: string;
  phone: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  billDate: Date;
  overdueDays: number;
}

/**
 * Result returned by every notification provider after attempting to send.
 */
export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Interface every notification provider must implement.
 * This allows easy swapping between WhatsApp Meta, Twilio, MSG91, etc.
 */
export interface NotificationProvider {
  readonly name: string;
  readonly type: "whatsapp" | "sms";

  /**
   * Send a notification to the given phone number.
   */
  send(payload: NotificationPayload): Promise<NotificationResult>;

  /**
   * Check if the provider is properly configured and ready to send.
   */
  isConfigured(): boolean;
}
