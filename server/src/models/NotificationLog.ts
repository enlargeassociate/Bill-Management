import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface INotificationLog extends Document {
  billId: Types.ObjectId;
  companyId: Types.ObjectId;
  type: "sms" | "whatsapp";
  phone: string;
  message: string;
  status: "sent" | "failed";
  error?: string;
  messageId?: string;
  sentAt: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
    billId: { type: Schema.Types.ObjectId, ref: "Bill", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    type: { type: String, enum: ["sms", "whatsapp"], required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["sent", "failed"], required: true },
    error: { type: String },
    messageId: { type: String },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for efficient querying
notificationLogSchema.index({ billId: 1 });
notificationLogSchema.index({ companyId: 1 });
notificationLogSchema.index({ sentAt: -1 });
notificationLogSchema.index({ status: 1, sentAt: -1 });

export const NotificationLog = mongoose.model<INotificationLog>("NotificationLog", notificationLogSchema);
