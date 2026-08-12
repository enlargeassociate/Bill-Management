import { Badge } from "@/components/ui/badge";
import { displayStatus } from "@/lib/format";
import type { Bill, PaymentMethod } from "@/types";

export function StatusBadge({ bill }: { bill: Bill }) {
  const status = displayStatus(bill);
  const styles: Record<string, string> = {
    PENDING: "bg-info-soft text-primary border-transparent",
    COMPLETED: "bg-success-soft text-success border-transparent",
    OVERDUE: "bg-danger-soft text-destructive border-transparent",
  };
  return (
    <Badge variant="outline" className={`font-semibold tracking-wide ${styles[status]}`}>
      {status}
    </Badge>
  );
}

export function PaymentBadge({ method }: { method?: PaymentMethod | undefined }) {
  if (!method) return <span className="text-muted-foreground">-</span>;
  const styles: Record<PaymentMethod, string> = {
    CASH: "bg-warning-soft text-warning-foreground",
    CHEQUE: "bg-secondary text-secondary-foreground",
    ONLINE: "bg-info-soft text-primary",
  };
  return (
    <Badge variant="outline" className={`border-transparent font-semibold ${styles[method]}`}>
      {method}
    </Badge>
  );
}
