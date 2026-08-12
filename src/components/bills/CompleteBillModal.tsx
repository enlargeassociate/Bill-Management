import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCompanies } from "@/hooks/use-companies";
import { useCompleteBill } from "@/hooks/use-bills";
import { formatDate, formatINR, paidTotal, remainingAmount } from "@/lib/format";
import type { Bill, PaymentMethod } from "@/types";

const methods: PaymentMethod[] = ["CASH", "CHEQUE", "ONLINE"];

export function CompleteBillModal({
  bill,
  open,
  onOpenChange,
}: {
  bill: Bill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [error, setError] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const { data: companies = [] } = useCompanies();
  const completeBillMutation = useCompleteBill();

  if (!bill) return null;
  const company = companies.find((c) => c.id === bill.companyId);

  const alreadyPaid = paidTotal(bill);
  const due = remainingAmount(bill);

  const rows: [string, string][] = [
    ["Company", company?.name ?? "-"],
    ["Invoice Number", bill.invoiceNumber],
    ["Total Amount", formatINR(bill.totalAmount)],
    ...(alreadyPaid > 0 ? ([["Already Paid", formatINR(alreadyPaid)]] as [string, string][]) : []),
    ["Remaining", formatINR(due)],
    ["Bill Date", formatDate(bill.billDate)],
  ];

  const entered = Number(paidAmount);
  const previewRemaining =
    paidAmount.trim() === "" || Number.isNaN(entered) ? due : Math.max(0, due - entered);

  const reset = () => {
    setMethod("");
    setError(false);
    setPaidAmount("");
    setAmountError("");
  };

  const handleComplete = () => {
    let invalid = false;
    if (!method) {
      setError(true);
      invalid = true;
    }
    const amount = Number(paidAmount);
    if (paidAmount.trim() === "" || Number.isNaN(amount)) {
      setAmountError("Paid amount is required.");
      invalid = true;
    } else if (amount <= 0) {
      setAmountError("Paid amount must be greater than 0.");
      invalid = true;
    } else if (amount > due) {
      setAmountError(`Paid amount cannot exceed the remaining ${formatINR(due)}.`);
      invalid = true;
    }
    if (invalid || !method) return;

    completeBillMutation.mutate(
      { id: bill.id, paymentMethod: method, paidAmount: amount },
      {
        onSuccess: () => {
          const left = Math.max(0, due - amount);
          if (left > 0) {
            toast.success(`Payment of ${formatINR(amount)} recorded. ${formatINR(left)} remaining — bill stays pending.`);
          } else {
            toast.success("Bill completed successfully. Payment confirmation sent.");
          }
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to complete bill.");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Enter the amount received. Partial payments keep the bill pending with the balance remaining.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-2">
          <Label>Select Payment Method *</Label>
          <RadioGroup
            value={method}
            onValueChange={(v) => {
              setMethod(v as PaymentMethod);
              setError(false);
            }}
            className="grid gap-2 sm:grid-cols-3"
          >
            {methods.map((m) => (
              <Label
                key={m}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  method === m ? "border-primary bg-info-soft" : "border-border hover:bg-muted"
                }`}
              >
                <RadioGroupItem value={m} />
                {m.charAt(0) + m.slice(1).toLowerCase()}
              </Label>
            ))}
          </RadioGroup>
          {error ? <p className="text-sm text-destructive">Payment method is required.</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paid-amount">Paid Amount (₹) *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="paid-amount"
              type="number"
              min="0"
              max={due}
              step="1"
              inputMode="decimal"
              value={paidAmount}
              placeholder={String(due)}
              onChange={(e) => {
                setPaidAmount(e.target.value);
                setAmountError("");
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPaidAmount(String(due));
                setAmountError("");
              }}
            >
              Full
            </Button>
          </div>
          {amountError ? (
            <p className="text-sm text-destructive">{amountError}</p>
          ) : previewRemaining > 0 ? (
            <p className="text-sm text-muted-foreground">
              {formatINR(previewRemaining)} will remain and the bill stays pending.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Full payment — the bill will be marked completed.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={completeBillMutation.isPending}>
            {completeBillMutation.isPending
              ? "Processing…"
              : previewRemaining > 0
                ? "Record Payment"
                : "Complete Bill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
