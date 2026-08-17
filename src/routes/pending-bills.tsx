import { createFileRoute } from "@tanstack/react-router";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { BillTable } from "@/components/bills/BillTable";
import { ExportBills } from "@/components/bills/ExportBills";
import { LoadingState } from "@/components/common/LoadingState";
import { useBills } from "@/hooks/use-bills";

export const Route = createFileRoute("/pending-bills")({
  component: PendingBillsPage,
});

function PendingBillsPage() {
  const { data: bills = [], isLoading } = useBills({ status: "PENDING" });

  if (isLoading) return <ProtectedPage title="Pending Bills" subtitle="Loading…"><LoadingState /></ProtectedPage>;

  return (
    <ProtectedPage title="Pending Bills" subtitle="Bills awaiting payment">
      <div className="space-y-4">
        <ExportBills bills={bills} filenamePrefix="pending-bills" />
        <BillTable
          bills={bills}
          hideStatusFilter
          emptyTitle="No pending bills."
          emptyDescription="Everything is settled — nice work."
        />
      </div>
    </ProtectedPage>
  );
}
