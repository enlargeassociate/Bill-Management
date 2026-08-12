import type { Bill, Company } from "@/types";

const iso = (d: Date) => d.toISOString();
const day = (offset: number) => {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return iso(d);
};

export const mockCompanies: Company[] = [
  { id: "c1", name: "ABC Technologies Pvt Ltd", phone: "9876543210", createdAt: day(-210) },
  { id: "c2", name: "Shree Enterprises", phone: "9825011223", createdAt: day(-180) },
  { id: "c3", name: "Patel Industries", phone: "9812345678", createdAt: day(-150) },
  { id: "c4", name: "Nova Infotech", phone: "9900112233", createdAt: day(-120) },
  { id: "c5", name: "Global Traders", phone: "9765432109", createdAt: day(-90) },
  { id: "c6", name: "Darji Solutions", phone: "9723456789", createdAt: day(-60) },
];

type Seed = [string, string, number, number, number, ("CASH" | "CHEQUE" | "ONLINE")?];

// companyId, invoiceNumber, amount, createdOffset, billDateOffset, paymentMethod (completed if present)
const seeds: Seed[] = [
  ["c1", "INV-5001", 75000, -40, -35],
  ["c1", "INV-5002", 120000, -75, -70, "ONLINE"],
  ["c1", "INV-5003", 25000, -18, -15],
  ["c1", "INV-5004", 250000, -110, -105, "CHEQUE"],
  ["c2", "INV-5005", 48500, -30, -25],
  ["c2", "INV-5006", 12500, -22, -20],
  ["c2", "INV-5007", 18500, -60, -55, "CASH"],
  ["c2", "INV-5008", 90000, -50, -45, "ONLINE"],
  ["c3", "INV-5009", 145000, -35, -30],
  ["c3", "INV-5010", 62000, -28, -25],
  ["c3", "INV-5011", 210000, -95, -90, "CHEQUE"],
  ["c3", "INV-5012", 34500, -12, -10],
  ["c4", "INV-5013", 185000, -44, -40],
  ["c4", "INV-5014", 55000, -20, -15],
  ["c4", "INV-5015", 98000, -70, -65, "ONLINE"],
  ["c4", "INV-5016", 27500, -15, -12],
  ["c5", "INV-5017", 320000, -55, -50],
  ["c5", "INV-5018", 148000, -80, -75, "CASH"],
  ["c5", "INV-5019", 42000, -26, -22],
  ["c5", "INV-5020", 275000, -100, -95, "ONLINE"],
  ["c6", "INV-5021", 165000, -33, -28],
  ["c6", "INV-5022", 58500, -19, -15],
  ["c6", "INV-5023", 240000, -88, -83, "CHEQUE"],
  ["c6", "INV-5024", 32000, -10, -7],
  ["c6", "INV-5025", 415000, -120, -115, "ONLINE"],
];

export const mockBills: Bill[] = seeds.map(
  ([companyId, invoiceNumber, totalAmount, created, billDateOffset, pm], i) => ({
    id: `b${i + 1}`,
    companyId,
    invoiceNumber,
    totalAmount,
    createdAt: day(created),
    billDate: day(billDateOffset),
    status: pm ? "COMPLETED" : "PENDING",
    ...(pm ? { paymentMethod: pm, completedAt: day(billDateOffset + 5) } : {}),
  }),
);
