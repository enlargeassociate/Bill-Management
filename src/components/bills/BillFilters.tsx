import { Filter, X, CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Company } from "@/types";

export interface BillFilterState {
  status: "ALL" | "PENDING" | "COMPLETED" | "OVERDUE";
  companyId: string;
  paymentMethod: "ALL" | "CASH" | "CHEQUE" | "ONLINE";
  dateField: "createdAt" | "billDate";
  dateFrom: string;
  dateTo: string;
}

export const emptyFilters: BillFilterState = {
  status: "ALL",
  companyId: "ALL",
  paymentMethod: "ALL",
  dateField: "createdAt",
  dateFrom: "",
  dateTo: "",
};

const activeCount = (f: BillFilterState, hideStatus = false) =>
  [!hideStatus && f.status !== "ALL", f.companyId !== "ALL", f.paymentMethod !== "ALL", !!f.dateFrom, !!f.dateTo]
    .filter(Boolean).length;

export function BillFilters({
  filters,
  onChange,
  companies,
  hideStatusFilter = false,
}: {
  filters: BillFilterState;
  onChange: (filters: BillFilterState) => void;
  companies: Company[];
  hideStatusFilter?: boolean;
}) {
  const count = activeCount(filters, hideStatusFilter);
  const set = <K extends keyof BillFilterState>(key: K, value: BillFilterState[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="bg-card">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {count > 0 ? (
              <span className="ml-2 rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[300px] space-y-4">
          {!hideStatusFilter && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => set("status", v as BillFilterState["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["ALL", "PENDING", "COMPLETED", "OVERDUE"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Company</Label>
            <Select value={filters.companyId} onValueChange={(v) => set("companyId", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Payment Method</Label>
            <Select
              value={filters.paymentMethod}
              onValueChange={(v) => set("paymentMethod", v as BillFilterState["paymentMethod"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["ALL", "CASH", "CHEQUE", "ONLINE"].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Date filter</Label>
            <Select
              value={filters.dateField}
              onValueChange={(v) => set("dateField", v as BillFilterState["dateField"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="billDate">Bill Date</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start text-left text-xs font-normal",
                      !filters.dateFrom && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                    {filters.dateFrom
                      ? format(parse(filters.dateFrom, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")
                      : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      filters.dateFrom
                        ? parse(filters.dateFrom, "yyyy-MM-dd", new Date())
                        : undefined
                    }
                    onSelect={(date) => set("dateFrom", date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start text-left text-xs font-normal",
                      !filters.dateTo && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                    {filters.dateTo
                      ? format(parse(filters.dateTo, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")
                      : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      filters.dateTo
                        ? parse(filters.dateTo, "yyyy-MM-dd", new Date())
                        : undefined
                    }
                    onSelect={(date) => set("dateTo", date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {count > 0 ? (
        <Button variant="ghost" size="sm" onClick={() => onChange(emptyFilters)}>
          <X className="mr-1 h-4 w-4" /> Clear
        </Button>
      ) : null}
    </div>
  );
}
