import { createFileRoute } from "@tanstack/react-router";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { BillTable } from "@/components/bills/BillTable";
import { LoadingState } from "@/components/common/LoadingState";
import { useBills } from "@/hooks/use-bills";

export const Route = createFileRoute("/completed-bills")({
  component: CompletedBillsPage,
});

function CompletedBillsPage() {
  const { data: bills = [], isLoading } = useBills({ status: "COMPLETED" });

  if (isLoading) return <ProtectedPage title="Completed Bills" subtitle="Loading…"><LoadingState /></ProtectedPage>;

  return (
    <ProtectedPage title="Completed Bills" subtitle="Bills that have been paid">
      <BillTable
        bills={bills}
        variant="completed"
        emptyTitle="No completed bills yet."
        emptyDescription="Completed bills will appear here once payments are recorded."
      />
    </ProtectedPage>
  );
}
