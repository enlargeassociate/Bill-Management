import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Bill } from "@/types";
import { formatINR, isOverdue } from "@/lib/format";

const COLORS = {
  pending: "var(--chart-1)",
  overdue: "var(--chart-5)",
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card-surface p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="h-[260px] w-full">{children}</div>
    </div>
  );
}

export function BillStatusChart({ bills }: { bills: Bill[] }) {
  const data = [
    {
      name: "Pending",
      value: bills.filter((b) => b.status === "PENDING" && !isOverdue(b)).length,
      color: COLORS.pending,
    },
    { name: "Overdue", value: bills.filter(isOverdue).length, color: COLORS.overdue },
  ].filter((d) => d.value > 0);

  return (
    <ChartCard title="Bill Status" subtitle="Pending and overdue bills">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="var(--card)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
          />
          <Legend verticalAlign="bottom" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyBillChart({ bills }: { bills: Bill[] }) {
  const months: { key: string; label: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      amount: 0,
    });
  }
  bills.forEach((b) => {
    const d = new Date(b.createdAt);
    const entry = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (entry) entry.amount += b.totalAmount;
  });

  return (
    <ChartCard title="Monthly Bill Amount" subtitle="Pending and overdue bill value by creation month">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={months}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis
            tickFormatter={(v: number) => (v >= 100000 ? `${v / 100000}L` : `${v / 1000}k`)}
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <Tooltip
            formatter={(v: number) => formatINR(v)}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
          />
          <Bar dataKey="amount" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
