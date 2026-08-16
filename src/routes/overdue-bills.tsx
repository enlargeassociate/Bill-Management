import { createFileRoute } from "@tanstack/react-router";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { BillTable } from "@/components/bills/BillTable";
import { LoadingState } from "@/components/common/LoadingState";
import { useBills } from "@/hooks/use-bills";
import { isOverdue } from "@/lib/format";

export const Route = createFileRoute("/overdue-bills")({
  component: OverdueBillsPage,
});

function OverdueBillsPage() {
  const { data: bills = [], isLoading } = useBills();
  const overdueBills = bills.filter(isOverdue);

  if (isLoading) return <ProtectedPage title="Overdue Bills" subtitle="Loading…"><LoadingState /></ProtectedPage>;

  return (
    <ProtectedPage title="Overdue Bills" subtitle="Bills past their due date">
      <BillTable
        bills={overdueBills}
        hideStatusFilter
        emptyTitle="No overdue bills."
        emptyDescription="All bills are within their due date — great job!"
      />
    </ProtectedPage>
  );
}
