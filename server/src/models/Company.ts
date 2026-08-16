import mongoose, { Schema, type Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  phone: string;
  createdAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export const Company = mongoose.model<ICompany>("Company", companySchema);
