import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-in-production",

  // WhatsApp Business Cloud API (Meta) — FREE 1,000 messages/month
  WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN || "",
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
  WHATSAPP_TEMPLATE_NAME: process.env.WHATSAPP_TEMPLATE_NAME || "overdue_reminder",

  // Notification settings
  NOTIFICATION_PROVIDER: (process.env.NOTIFICATION_PROVIDER || "whatsapp_meta") as
    | "whatsapp_meta"
    | "console",
  OVERDUE_DAYS: parseInt(process.env.OVERDUE_DAYS || "7", 10),
  OVERDUE_CRON_SCHEDULE: process.env.OVERDUE_CRON_SCHEDULE || "0 9 * * *",

  // Retry config
  NOTIFICATION_MAX_RETRIES: parseInt(process.env.NOTIFICATION_MAX_RETRIES || "3", 10),
  NOTIFICATION_RETRY_DELAY_MS: parseInt(process.env.NOTIFICATION_RETRY_DELAY_MS || "2000", 10),
};
