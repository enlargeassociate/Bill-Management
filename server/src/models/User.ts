import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  role: "ADMIN" | "VIEWER";
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "VIEWER"], default: "VIEWER" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
