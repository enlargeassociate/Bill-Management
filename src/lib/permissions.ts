import type { User } from "@/types";

export const isAdmin = (user: User | null) => user?.role === "ADMIN";

export const canAddCompany = isAdmin;
export const canEditCompany = isAdmin;
export const canDeleteCompany = isAdmin;
export const canAddBill = isAdmin;
export const canEditBill = isAdmin;
export const canDeleteBill = isAdmin;
export const canCompleteBill = isAdmin;
