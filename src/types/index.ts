export type UserRole = "ADMIN" | "VIEWER";

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

export interface Company {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export type BillStatus = "PENDING" | "COMPLETED";
export type PaymentMethod = "CASH" | "CHEQUE" | "ONLINE";

export interface PaymentEntry {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
}

export interface Bill {
  id: string;
  companyId: string;
  invoiceNumber: string;
  totalAmount: number;
  createdAt: string;
  billDate: string;
  status: BillStatus;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  payments?: PaymentEntry[];
  completedAt?: string;
}
