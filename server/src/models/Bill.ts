import mongoose, { Schema, type Document, type Types } from "mongoose";

export type BillStatus = "PENDING" | "COMPLETED" | "OVERDUE";
export type PaymentMethod = "CASH" | "CHEQUE" | "ONLINE";

export interface IPaymentEntry {
  _id?: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
}

export interface IBill extends Document {
  companyId: Types.ObjectId;
  invoiceNumber: string;
  totalAmount: number;
  billDate: Date;
  status: BillStatus;
  paymentMethod?: PaymentMethod;
  paidAmount: number;
  payments: IPaymentEntry[];
  completedAt?: Date;
  overdueNotifiedAt?: Date;
  createdAt: Date;
}

const paymentEntrySchema = new Schema<IPaymentEntry>(
  {
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["CASH", "CHEQUE", "ONLINE"], required: true },
    paidAt: { type: Date, required: true, default: Date.now },
  },
  { _id: true }
);

const billSchema = new Schema<IBill>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    invoiceNumber: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    billDate: { type: Date, required: true },
    status: { type: String, enum: ["PENDING", "COMPLETED", "OVERDUE"], default: "PENDING" },
    paymentMethod: { type: String, enum: ["CASH", "CHEQUE", "ONLINE"] },
    paidAmount: { type: Number, default: 0, min: 0 },
    payments: { type: [paymentEntrySchema], default: [] },
    completedAt: { type: Date },
    overdueNotifiedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for efficient overdue queries
billSchema.index({ status: 1, billDate: 1 });
billSchema.index({ companyId: 1 });

export const Bill = mongoose.model<IBill>("Bill", billSchema);
