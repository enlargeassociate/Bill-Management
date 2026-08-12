export type UserRole = "ADMIN" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
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
  completedAt?: string;
}
