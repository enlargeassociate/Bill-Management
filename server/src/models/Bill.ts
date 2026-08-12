import mongoose, { Schema, type Document, type Types } from "mongoose";

export type BillStatus = "PENDING" | "COMPLETED" | "OVERDUE";
export type PaymentMethod = "CASH" | "CHEQUE" | "ONLINE";

export interface IBill extends Document {
  companyId: Types.ObjectId;
  invoiceNumber: string;
  totalAmount: number;
  billDate: Date;
  status: BillStatus;
  paymentMethod?: PaymentMethod;
  paidAmount: number;
  completedAt?: Date;
  overdueNotifiedAt?: Date;
  createdAt: Date;
}

const billSchema = new Schema<IBill>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    invoiceNumber: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    billDate: { type: Date, required: true },
    status: { type: String, enum: ["PENDING", "COMPLETED", "OVERDUE"], default: "PENDING" },
    paymentMethod: { type: String, enum: ["CASH", "CHEQUE", "ONLINE"] },
    paidAmount: { type: Number, default: 0, min: 0 },
    completedAt: { type: Date },
    overdueNotifiedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for efficient overdue queries
billSchema.index({ status: 1, billDate: 1 });
billSchema.index({ companyId: 1 });

export const Bill = mongoose.model<IBill>("Bill", billSchema);
