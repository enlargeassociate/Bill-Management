import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Company } from "@/types";
import { mockCompanies } from "@/lib/mockData";
import { useAuthStore } from "./authStore";

const guard = () => useAuthStore.getState().currentUser?.role === "ADMIN";

interface CompanyState {
  companies: Company[];
  addCompany: (data: { name: string; phone: string }) => boolean;
  updateCompany: (id: string, data: { name: string; phone: string }) => boolean;
  deleteCompany: (id: string) => boolean;
  getCompanyById: (id: string) => Company | undefined;
  resetCompanies: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: mockCompanies,
      addCompany: (data) => {
        if (!guard()) return false;
        const company: Company = {
          id: crypto.randomUUID(),
          name: data.name.trim(),
          phone: data.phone.trim(),
          createdAt: new Date().toISOString(),
        };
        set({ companies: [company, ...get().companies] });
        return true;
      },
      updateCompany: (id, data) => {
        if (!guard()) return false;
        set({
          companies: get().companies.map((c) =>
            c.id === id ? { ...c, name: data.name.trim(), phone: data.phone.trim() } : c,
          ),
        });
        return true;
      },
      deleteCompany: (id) => {
        if (!guard()) return false;
        set({ companies: get().companies.filter((c) => c.id !== id) });
        return true;
      },
      getCompanyById: (id) => get().companies.find((c) => c.id === id),
      resetCompanies: () => set({ companies: mockCompanies }),
    }),
    { name: "bms-companies" },
  ),
);
