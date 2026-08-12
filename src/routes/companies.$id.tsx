import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Phone, Plus, FileText, Clock, AlertTriangle } from "lucide-react";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { BillTable } from "@/components/bills/BillTable";
import { BillForm } from "@/components/bills/BillForm";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuthStore } from "@/store/authStore";
import { useCompany } from "@/hooks/use-companies";
import { useBills } from "@/hooks/use-bills";
import { formatINR, isOverdue, remainingAmount } from "@/lib/format";
import { canAddBill } from "@/lib/permissions";

export const Route = createFileRoute("/companies/$id")({
  component: CompanyDetailPage,
});

function CompanyDetailPage() {
  const { id } = Route.useParams();
  const { data: company, isLoading: companyLoading } = useCompany(id);
  const { data: allBills = [], isLoading: billsLoading } = useBills({ companyId: id });
  const user = useAuthStore((s) => s.currentUser);
  const [addOpen, setAddOpen] = useState(false);

  const isLoading = companyLoading || billsLoading;

  if (isLoading) return <ProtectedPage title="Company" subtitle="Loading…"><LoadingState /></ProtectedPage>;

  const bills = allBills;
  const pending = bills.filter((b) => b.status === "PENDING");
  const overdueBills = bills.filter(isOverdue);
  const sum = (rows: typeof bills) => rows.reduce((t, b) => t + b.totalAmount, 0);
  const overdueAmount = overdueBills.reduce((t, b) => t + remainingAmount(b), 0);

  return (
    <ProtectedPage title={company?.name ?? "Company"} subtitle="Company details and bill history">
      <div className="space-y-6">
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to companies
        </Link>

        {!company ? (
          <div className="card-surface p-8 text-center text-muted-foreground">
            This company no longer exists.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="card-surface flex-1 p-5">
                <h2 className="text-lg font-semibold">{company.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" /> {company.phone}
                </p>
              </div>
              {canAddBill(user) ? (
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Bill
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total Bills" value={bills.length} icon={FileText} tone="primary" />
              <StatCard
                label="Pending Amount"
                value={formatINR(sum(pending))}
                icon={Clock}
                tone="warning"
              />
              <StatCard
                label="Overdue Amount"
                value={formatINR(overdueAmount)}
                icon={AlertTriangle}
                tone="warning"
              />
            </div>

            <BillTable
              bills={bills}
              defaultCompanyId={company.id}
              showCompany={false}
              emptyTitle="No bills for this company yet."
              emptyDescription="Add a bill to start tracking payments."
            />
          </>
        )}
      </div>
      {company ? (
        <BillForm open={addOpen} onOpenChange={setAddOpen} defaultCompanyId={company.id} />
      ) : null}
    </ProtectedPage>
  );
}
