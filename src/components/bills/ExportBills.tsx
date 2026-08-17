import { useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/common/DateInput";
import { useCompanies } from "@/hooks/use-companies";
import {
  displayStatus,
  formatDate,
  paidTotal,
  pendingDays,
  remainingAmount,
} from "@/lib/format";
import type { Bill } from "@/types";

type DatePreset = "all" | "this-month" | "last-month" | "last-3-months" | "custom";

interface ExportBillsProps {
  bills: Bill[];
  filenamePrefix: string;
}

export function ExportBills({ bills, filenamePrefix }: ExportBillsProps) {
  const { data: companies = [] } = useCompanies();
  const [preset, setPreset] = useState<DatePreset>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "-";
  const companyPhone = (id: string) => companies.find((c) => c.id === id)?.phone ?? "-";

  const getFilteredBills = () => {
    const now = new Date();
    let from: Date | null = null;
    let to: Date | null = null;

    switch (preset) {
      case "this-month":
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case "last-month":
        from = startOfMonth(subMonths(now, 1));
        to = endOfMonth(subMonths(now, 1));
        break;
      case "last-3-months":
        from = startOfMonth(subMonths(now, 2));
        to = endOfMonth(now);
        break;
      case "custom":
        if (dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) from = new Date(dateFrom);
        if (dateTo && /^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
          to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
        }
        break;
      case "all":
      default:
        break;
    }

    return bills.filter((b) => {
      const billDate = new Date(b.billDate);
      if (from && billDate < from) return false;
      if (to && billDate > to) return false;
      return true;
    });
  };

  const handleExport = () => {
    const filtered = getFilteredBills();
    if (filtered.length === 0) return;

    const data = filtered.map((bill) => ({
      Company: companyName(bill.companyId),
      Phone: companyPhone(bill.companyId),
      "Invoice No.": bill.invoiceNumber,
      Amount: bill.totalAmount,
      "Bill Date": formatDate(bill.billDate),
      Paid: paidTotal(bill),
      Remaining: remainingAmount(bill),
      "Pending Days": pendingDays(bill) ?? "-",
      Status: displayStatus(bill),
      "Payment Method": bill.paymentMethod ?? "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bills");

    const dateStr = format(new Date(), "dd-MM-yyyy");
    XLSX.writeFile(wb, `${filenamePrefix}-${dateStr}.xlsx`);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Period</Label>
        <Select value={preset} onValueChange={(v) => setPreset(v as DatePreset)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {preset === "custom" && (
        <div className="flex items-end gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <DateInput value={dateFrom} onChange={setDateFrom} className="w-[180px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <DateInput value={dateTo} onChange={setDateTo} className="w-[180px]" />
          </div>
        </div>
      )}

      <Button onClick={handleExport} variant="outline" className="bg-card">
        <Download className="mr-2 h-4 w-4" />
        Download Excel
      </Button>
    </div>
  );
}
