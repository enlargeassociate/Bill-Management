import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { BillTable } from "@/components/bills/BillTable";
import { BillForm } from "@/components/bills/BillForm";
import { LoadingState } from "@/components/common/LoadingState";
import { useAuthStore } from "@/store/authStore";
import { useBills } from "@/hooks/use-bills";
import { canAddBill } from "@/lib/permissions";

export const Route = createFileRoute("/bills/")({
  component: BillsPage,
});

function BillsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const user = useAuthStore((s) => s.currentUser);
  const { data: bills = [], isLoading } = useBills();

  if (isLoading) return <ProtectedPage title="All Bills" subtitle="Loading…" adminOnly><LoadingState /></ProtectedPage>;

  return (
    <ProtectedPage title="All Bills" subtitle="Every bill across all companies" adminOnly>
      <div className="space-y-4">
        {canAddBill(user) ? (
          <div className="flex justify-end">
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Bill
            </Button>
          </div>
        ) : null}
        <BillTable bills={bills} />
      </div>
      <BillForm open={addOpen} onOpenChange={setAddOpen} />
    </ProtectedPage>
  );
}
