import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BadgeIndianRupee,
  Clock,
  FileText,
  IndianRupee,
  Wallet,
} from "lucide-react";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { StatCard } from "@/components/dashboard/StatCard";
import { BillStatusChart, MonthlyBillChart } from "@/components/dashboard/Charts";
import { BillTable } from "@/components/bills/BillTable";
import { LoadingState } from "@/components/common/LoadingState";
import { useBills } from "@/hooks/use-bills";
import { formatINR, isOverdue } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: bills = [], isLoading } = useBills();

  if (isLoading) return <ProtectedPage title="Dashboard" subtitle="Loading…" adminOnly><LoadingState /></ProtectedPage>;

  const pending = bills.filter((b) => b.status === "PENDING" && !isOverdue(b));
  const overdue = bills.filter(isOverdue);
  const active = bills.filter((b) => b.status !== "COMPLETED");
  const sum = (rows: typeof bills) => rows.reduce((t, b) => t + b.totalAmount, 0);

  return (
    <ProtectedPage title="Dashboard" subtitle="Overview of pending and overdue bills" adminOnly>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Bills" value={active.length} icon={FileText} tone="primary" />
          <StatCard label="Pending Bills" value={pending.length} icon={Clock} tone="warning" />
          <StatCard label="Overdue Bills" value={overdue.length} icon={AlertTriangle} tone="warning" />
          <StatCard label="Outstanding Amount" value={formatINR(sum(active))} icon={IndianRupee} />
          <StatCard label="Pending Amount" value={formatINR(sum(pending))} icon={Wallet} tone="warning" />
          <StatCard label="Overdue Amount" value={formatINR(sum(overdue))} icon={BadgeIndianRupee} tone="warning" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BillStatusChart bills={bills} />
          <MonthlyBillChart bills={active} />
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-semibold">Recent pending bills</h2>
          <BillTable
            bills={[...active]
              .sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())
              .slice(0, 5)}
            showFilters={false}
            showSearch={false}
          />
        </div>
      </div>
    </ProtectedPage>
  );
}
