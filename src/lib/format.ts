import type { Bill } from "@/types";

export const formatINR = (amount: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);

export const formatDate = (iso?: string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (iso?: string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const toDateInput = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

export const isOverdue = (bill: Bill) =>
  bill.status === "PENDING" && (Date.now() - new Date(bill.billDate).getTime()) > 10 * 86_400_000;

/** Days elapsed since the bill date, for bills still awaiting payment. */
export const pendingDays = (bill: Bill): number | null => {
  if (bill.status === "COMPLETED") return null;
  const ms = Date.now() - new Date(bill.billDate).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
};


export type DisplayStatus = "PENDING" | "COMPLETED" | "OVERDUE";

export const displayStatus = (bill: Bill): DisplayStatus =>
  bill.status === "COMPLETED" ? "COMPLETED" : isOverdue(bill) ? "OVERDUE" : "PENDING";

/** Amount recorded as paid so far. Legacy completed bills without a value count as fully paid. */
export const paidTotal = (bill: Bill) =>
  bill.paidAmount ?? (bill.status === "COMPLETED" ? bill.totalAmount : 0);

/** Amount still owed on the bill (never negative). */
export const remainingAmount = (bill: Bill) => Math.max(0, bill.totalAmount - paidTotal(bill));
