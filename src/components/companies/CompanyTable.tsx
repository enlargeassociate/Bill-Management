import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TablePagination } from "@/components/common/TablePagination";
import { CompanyForm } from "@/components/companies/CompanyForm";
import { useAuthStore } from "@/store/authStore";
import { useBills } from "@/hooks/use-bills";
import { useDeleteCompany } from "@/hooks/use-companies";
import { formatINR, isOverdue, remainingAmount } from "@/lib/format";
import { canDeleteCompany, canEditCompany } from "@/lib/permissions";
import type { Company } from "@/types";

export function CompanyTable({ search, companies }: { search: string; companies: Company[] }) {
  const user = useAuthStore((s) => s.currentUser);
  const { data: bills = [] } = useBills();
  const deleteCompanyMutation = useDeleteCompany();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const stats = (companyId: string) => {
    const own = bills.filter((b) => b.companyId === companyId);
    const pendingBills = own.filter((b) => b.status === "PENDING" && !isOverdue(b));
    const overdueBills = own.filter(isOverdue);
    const pendingAmt = pendingBills.reduce((t, b) => t + remainingAmount(b), 0);
    const overdueAmt = overdueBills.reduce((t, b) => t + remainingAmount(b), 0);
    return {
      totalAmount: own.reduce((t, b) => t + b.totalAmount, 0),
      pending: pendingAmt,
      overdue: overdueAmt,
      outstanding: pendingAmt + overdueAmt,
    };
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [companies, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const deleteTargetBills = deleteTarget
    ? bills.filter((b) => b.companyId === deleteTarget.id).length
    : 0;

  return (
    <div className="card-surface overflow-hidden">
      {paged.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found."
          description="Add your first company to start managing bills."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="min-w-[200px]">Company Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="text-right">Total Bills</TableHead>
                  <TableHead className="text-right">Pending Amount</TableHead>
                  <TableHead className="text-right">Overdue Amount</TableHead>
                  <TableHead className="text-right">Total Outstanding</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((company) => {
                  const s = stats(company.id);
                  return (
                    <TableRow key={company.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">
                        <Link
                          to="/companies/$id"
                          params={{ id: company.id }}
                          className="hover:text-primary hover:underline"
                        >
                          {company.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{company.phone}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatINR(s.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatINR(s.pending)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-destructive">
                        {formatINR(s.overdue)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatINR(s.outstanding)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Company actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEditCompany(user) ? (
                              <DropdownMenuItem onClick={() => setEditTarget(company)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            ) : null}
                            {canDeleteCompany(user) ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(company)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

      <CompanyForm
        open={!!editTarget}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
        company={editTarget}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Delete Company?"
        description="Are you sure you want to delete this company? This action cannot be undone."
        {...(deleteTargetBills > 0
          ? {
              warning:
                "This company has existing bills. Deleting the company may also affect its associated bills.",
            }
          : {})}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCompanyMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Company deleted successfully.");
              setDeleteTarget(null);
            },
            onError: (err) => {
              toast.error(err.message || "Failed to delete company.");
              setDeleteTarget(null);
            },
          });
        }}
      />
    </div>
  );
}
