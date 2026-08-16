import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowUpDown,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TablePagination } from "@/components/common/TablePagination";
import { PaymentBadge, StatusBadge } from "@/components/common/StatusBadge";
import { BillForm } from "@/components/bills/BillForm";
import { CompleteBillModal } from "@/components/bills/CompleteBillModal";
import { BillFilters, type BillFilterState, emptyFilters } from "@/components/bills/BillFilters";
import { useAuthStore } from "@/store/authStore";
import { useCompanies } from "@/hooks/use-companies";
import { useDeleteBill } from "@/hooks/use-bills";
import {
  displayStatus,
  formatDate,
  formatINR,
  isOverdue,
  paidTotal,
  pendingDays,
  remainingAmount,
} from "@/lib/format";
import {
  canCompleteBill,
  canDeleteBill,
  canEditBill,
} from "@/lib/permissions";
import type { Bill } from "@/types";

type SortKey = "company" | "totalAmount" | "createdAt" | "billDate" | "status" | "pendingDays";

export function BillTable({
  bills,
  variant = "default",
  showFilters = true,
  showSearch = true,
  showCompany = true,
  hideStatusFilter = false,
  emptyTitle = "No bills found.",
  emptyDescription = "Add a bill to start tracking payments.",
  defaultCompanyId,
}: {
  bills: Bill[];
  variant?: "default" | "completed";
  showFilters?: boolean;
  showSearch?: boolean;
  showCompany?: boolean;
  hideStatusFilter?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  defaultCompanyId?: string | undefined;
}) {
  const user = useAuthStore((s) => s.currentUser);
  const { data: companies = [] } = useCompanies();
  const deleteBillMutation = useDeleteBill();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<BillFilterState>(emptyFilters);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "createdAt",
    dir: "desc",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Bill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bill | null>(null);

  // Always use the latest bill data from props for the complete modal
  const latestCompleteTarget = completeTarget
    ? bills.find((b) => b.id === completeTarget.id) ?? completeTarget
    : null;

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "-";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = bills.filter((b) => {
      if (q) {
        const haystack = [companyName(b.companyId), b.invoiceNumber]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.status !== "ALL" && displayStatus(b) !== filters.status) return false;
      if (filters.companyId !== "ALL" && b.companyId !== filters.companyId) return false;
      if (filters.paymentMethod !== "ALL" && b.paymentMethod !== filters.paymentMethod) return false;
      if (filters.dateFrom || filters.dateTo) {
        const value = new Date(filters.dateField === "createdAt" ? b.createdAt : b.billDate);
        if (filters.dateFrom && value < new Date(filters.dateFrom)) return false;
        if (filters.dateTo) {
          const to = new Date(filters.dateTo);
          to.setHours(23, 59, 59, 999);
          if (value > to) return false;
        }
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "company":
          return companyName(a.companyId).localeCompare(companyName(b.companyId)) * dir;
        case "totalAmount":
          return (a.totalAmount - b.totalAmount) * dir;
        case "status":
          return displayStatus(a).localeCompare(displayStatus(b)) * dir;
        case "pendingDays":
          return ((pendingDays(a) ?? -1) - (pendingDays(b) ?? -1)) * dir;
        case "billDate":
          return (new Date(a.billDate).getTime() - new Date(b.billDate).getTime()) * dir;
        default:
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
      }
    });
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills, companies, search, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );

  const SortHead = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKey)}
      className="inline-flex items-center gap-1 font-semibold hover:text-foreground"
    >
      {label}
      <ArrowUpDown className="h-3 w-3 opacity-60" />
    </button>
  );

  return (
    <div className="space-y-4">
      {showSearch || showFilters ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {showSearch ? (
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search bills, company, bill or invoice number"
              className="w-full sm:max-w-sm"
            />
          ) : null}
          {showFilters ? (
            <BillFilters
              filters={filters}
              onChange={(f) => {
                setFilters(f);
                setPage(1);
              }}
              companies={companies}
              hideStatusFilter={hideStatusFilter}
            />
          ) : null}
        </div>
      ) : null}

      <div className="card-surface overflow-hidden">
        {paged.length === 0 ? (
          <EmptyState icon={FileText} title={emptyTitle} description={emptyDescription} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[160px]">
                      <SortHead label="Company" sortKey="company" />
                    </TableHead>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead className="text-right">
                      <SortHead label="Amount" sortKey="totalAmount" />
                    </TableHead>
                    <TableHead>
                      <SortHead label="Created" sortKey="createdAt" />
                    </TableHead>
                    {variant === "completed" ? (
                      <TableHead>Completed</TableHead>
                    ) : (
                      <TableHead>
                        <SortHead label="Bill Date" sortKey="billDate" />
                      </TableHead>
                    )}
                    {variant === "completed" ? null : (
                      <>
                        <TableHead className="text-right whitespace-nowrap">Paid</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Remaining</TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          <SortHead label="Pending Days" sortKey="pendingDays" />
                        </TableHead>
                        <TableHead>
                          <SortHead label="Status" sortKey="status" />
                        </TableHead>
                      </>
                    )}
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((bill) => (
                    <TableRow key={bill.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium text-foreground">
                        {showCompany ? (
                          <Link
                            to="/companies/$id"
                            params={{ id: bill.companyId }}
                            className="hover:text-primary hover:underline"
                          >
                            {companyName(bill.companyId)}
                          </Link>
                        ) : (
                          companyName(bill.companyId)
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{bill.invoiceNumber}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatINR(bill.totalAmount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(bill.createdAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(variant === "completed" ? bill.completedAt : bill.billDate)}
                      </TableCell>
                      {variant === "completed" ? null : (
                        <>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {paidTotal(bill) > 0 ? formatINR(paidTotal(bill)) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {formatINR(remainingAmount(bill))}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {(() => {
                              const days = pendingDays(bill);
                              if (days === null) return <span className="text-muted-foreground">-</span>;
                              return (
                                <span
                                  className={
                                    isOverdue(bill) ? "font-semibold text-destructive" : "text-foreground"
                                  }
                                >
                                  {days} {days === 1 ? "day" : "days"}
                                </span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge bill={bill} />
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        <PaymentBadge method={bill.paymentMethod} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Bill actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditBill(user) && bill.status === "PENDING" ? (
                              <DropdownMenuItem onClick={() => setEditBill(bill)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            ) : null}
                            {canCompleteBill(user) && bill.status === "PENDING" ? (
                              <DropdownMenuItem onClick={() => setCompleteTarget(bill)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Complete
                              </DropdownMenuItem>
                            ) : null}
                            {canDeleteBill(user) ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(bill)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              total={filtered.length}
              page={currentPage}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      <BillForm
        open={!!editBill}
        onOpenChange={(o) => !o && setEditBill(null)}
        bill={editBill}
        defaultCompanyId={defaultCompanyId}
      />
      <CompleteBillModal
        bill={latestCompleteTarget}
        open={!!completeTarget}
        onOpenChange={(o) => !o && setCompleteTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Bill?"
        description="Are you sure you want to delete this bill? This action cannot be undone."
        confirmLabel="Delete Bill"
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteBillMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Bill deleted successfully.");
              setDeleteTarget(null);
            },
            onError: (err) => {
              toast.error(err.message || "Failed to delete bill.");
            },
          });
        }}
      />
    </div>
  );
}
