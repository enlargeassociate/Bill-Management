import type { Bill, Company, User } from "@/types";

const API_BASE = import.meta.env["VITE_API_URL"] || "http://localhost:5000/api";

class ApiClient {
  private getToken(): string | null {
    try {
      const auth = localStorage.getItem("bms-auth");
      if (!auth) return null;
      const parsed = JSON.parse(auth);
      return parsed?.state?.token || null;
    } catch {
      return null;
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (res.status === 401) {
      // Token expired or invalid — clear auth
      localStorage.removeItem("bms-auth");
      window.location.href = "/";
      throw new Error("Session expired");
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  // ─── Auth ───────────────────────────────────────────────────
  async login(username: string, password: string) {
    return this.request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe() {
    return this.request<User>("/auth/me");
  }

  // ─── Bills ──────────────────────────────────────────────────
  async getBills(params?: { status?: string; companyId?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.companyId) query.set("companyId", params.companyId);
    const qs = query.toString();
    return this.request<BillResponse[]>(`/bills${qs ? `?${qs}` : ""}`);
  }

  async getBillStats() {
    return this.request<BillStats>("/bills/stats");
  }

  async getBill(id: string) {
    return this.request<BillResponse>(`/bills/${id}`);
  }

  async createBill(data: { companyId: string; invoiceNumber: string; totalAmount: number; billDate: string }) {
    return this.request<BillResponse>("/bills", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBill(id: string, data: { companyId: string; invoiceNumber: string; totalAmount: number; billDate: string }) {
    return this.request<BillResponse>(`/bills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async completeBill(id: string, paymentMethod: string, paidAmount?: number, paymentDate?: string) {
    return this.request<BillResponse>(`/bills/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ paymentMethod, paidAmount, paymentDate }),
    });
  }

  async deleteBill(id: string) {
    return this.request<{ message: string }>(`/bills/${id}`, {
      method: "DELETE",
    });
  }

  async deletePayment(billId: string, paymentId: string) {
    return this.request<BillResponse>(`/bills/${billId}/payments/${paymentId}`, {
      method: "DELETE",
    });
  }

  // ─── Companies ──────────────────────────────────────────────
  async getCompanies() {
    return this.request<CompanyResponse[]>("/companies");
  }

  async getCompany(id: string) {
    return this.request<CompanyResponse>(`/companies/${id}`);
  }

  async createCompany(data: { name: string; phone: string }) {
    return this.request<CompanyResponse>("/companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCompany(id: string, data: { name: string; phone: string }) {
    return this.request<CompanyResponse>(`/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: string) {
    return this.request<{ message: string }>(`/companies/${id}`, {
      method: "DELETE",
    });
  }

  // ─── Health ─────────────────────────────────────────────────
  async health() {
    return this.request<{ status: string }>("/health");
  }
}

export const api = new ApiClient();

// ─── Response types (MongoDB _id mapped to id) ─────────────────

export interface BillResponse {
  _id: string;
  companyId: string | { _id: string; name: string; phone: string };
  invoiceNumber: string;
  totalAmount: number;
  billDate: string;
  createdAt: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  paymentMethod?: "CASH" | "CHEQUE" | "ONLINE";
  paidAmount?: number;
  payments?: { _id: string; amount: number; method: "CASH" | "CHEQUE" | "ONLINE"; paidAt: string }[];
  completedAt?: string;
}

export interface CompanyResponse {
  _id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface BillStats {
  totalBills: number;
  pendingBills: number;
  completedBills: number;
  overdueBills: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
}

// ─── Mappers ──────────────────────────────────────────────────

export function mapBill(b: BillResponse): Bill {
  const companyId = typeof b.companyId === "string" ? b.companyId : b.companyId._id;
  return {
    id: b._id,
    companyId,
    invoiceNumber: b.invoiceNumber,
    totalAmount: b.totalAmount,
    billDate: b.billDate,
    createdAt: b.createdAt,
    status: b.status === "OVERDUE" ? "PENDING" : b.status,
    ...(b.paymentMethod ? { paymentMethod: b.paymentMethod } : {}),
    ...(b.paidAmount !== undefined ? { paidAmount: b.paidAmount } : {}),
    ...(b.payments
      ? {
          payments: b.payments.map((p) => ({
            id: p._id,
            amount: p.amount,
            method: p.method,
            paidAt: p.paidAt,
          })),
        }
      : {}),
    ...(b.completedAt ? { completedAt: b.completedAt } : {}),
  };
}

export function mapCompany(c: CompanyResponse): Company {
  return {
    id: c._id,
    name: c.name,
    phone: c.phone,
    createdAt: c.createdAt,
  };
}
