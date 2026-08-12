import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Bill, PaymentMethod } from "@/types";
import { mockBills } from "@/lib/mockData";
import { isOverdue, remainingAmount } from "@/lib/format";
import { useAuthStore } from "./authStore";

const guard = () => useAuthStore.getState().currentUser?.role === "ADMIN";

export type BillInput = {
  companyId: string;
  invoiceNumber: string;
  totalAmount: number;
  billDate: string;
};

interface BillState {
  bills: Bill[];
  addBill: (data: BillInput) => boolean;
  updateBill: (id: string, data: BillInput) => boolean;
  deleteBill: (id: string) => boolean;
  completeBill: (id: string, paymentMethod: PaymentMethod, paidAmount?: number) => boolean;
  getBillById: (id: string) => Bill | undefined;
  getPendingBills: () => Bill[];
  getCompletedBills: () => Bill[];
  getOverdueBills: () => Bill[];
  getTotalAmount: () => number;
  getPendingAmount: () => number;
  getCompletedAmount: () => number;
  resetBills: () => void;
}

const sum = (bills: Bill[]) => bills.reduce((t, b) => t + b.totalAmount, 0);

export const useBillStore = create<BillState>()(
  persist(
    (set, get) => ({
      bills: mockBills,
      addBill: (data) => {
        if (!guard()) return false;
        const bill: Bill = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date().toISOString(),
          billDate: new Date(data.billDate).toISOString(),
          status: "PENDING",
        };
        set({ bills: [bill, ...get().bills] });
        return true;
      },
      updateBill: (id, data) => {
        if (!guard()) return false;
        const bill = get().bills.find((b) => b.id === id);
        if (!bill || bill.status === "COMPLETED") return false;
        set({
          bills: get().bills.map((b) =>
            b.id === id
              ? { ...b, ...data, billDate: new Date(data.billDate).toISOString() }
              : b,
          ),
        });
        return true;
      },
      deleteBill: (id) => {
        if (!guard()) return false;
        set({ bills: get().bills.filter((b) => b.id !== id) });
        return true;
      },
      completeBill: (id, paymentMethod, paidAmount) => {
        if (!guard()) return false;
        const bill = get().bills.find((b) => b.id === id);
        if (!bill || bill.status === "COMPLETED") return false;
        const alreadyPaid = bill.paidAmount ?? 0;
        const nextPaid = Math.min(bill.totalAmount, alreadyPaid + (paidAmount ?? bill.totalAmount - alreadyPaid));
        const settled = nextPaid >= bill.totalAmount;
        set({
          bills: get().bills.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: settled ? "COMPLETED" : "PENDING",
                  paymentMethod,
                  paidAmount: nextPaid,
                  ...(settled ? { completedAt: new Date().toISOString() } : {}),
                }
              : b,
          ),
        });
        return true;
      },

      getBillById: (id) => get().bills.find((b) => b.id === id),
      getPendingBills: () => get().bills.filter((b) => b.status === "PENDING"),
      getCompletedBills: () => get().bills.filter((b) => b.status === "COMPLETED"),
      getOverdueBills: () => get().bills.filter(isOverdue),
      getTotalAmount: () => sum(get().bills),
      getPendingAmount: () =>
        get()
          .bills.filter((b) => b.status === "PENDING")
          .reduce((t, b) => t + remainingAmount(b), 0),
      getCompletedAmount: () => sum(get().bills.filter((b) => b.status === "COMPLETED")),
      resetBills: () => set({ bills: mockBills }),
    }),
    {
      name: "bms-bills",
      version: 2,
      migrate: () => ({ bills: mockBills }),
    },
  ),
);
