import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
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
import { DateInput } from "@/components/common/DateInput";
import { useCompanies } from "@/hooks/use-companies";
import { useCompleteBill, useDeletePayment } from "@/hooks/use-bills";
import { formatDate, formatDateTime, formatINR, paidTotal, remainingAmount } from "@/lib/format";
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
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: companies = [] } = useCompanies();
  const completeBillMutation = useCompleteBill();
  const deletePaymentMutation = useDeletePayment();

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
    setPaymentDate(format(new Date(), "yyyy-MM-dd"));
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
      { id: bill.id, paymentMethod: method, paidAmount: amount, paymentDate },
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

  const handleDeletePayment = (paymentId: string) => {
    deletePaymentMutation.mutate(
      { billId: bill.id, paymentId },
      {
        onSuccess: () => {
          toast.success("Payment removed successfully.");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to remove payment.");
        },
      },
    );
  };

  const payments = bill.payments ?? [];

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

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment History</Label>
            <div className="rounded-xl border border-border bg-muted/40 divide-y divide-border">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">
                      {formatINR(payment.amount)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        via {payment.method.charAt(0) + payment.method.slice(1).toLowerCase()}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(payment.paidAt)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeletePayment(payment.id)}
                    disabled={deletePaymentMutation.isPending}
                    title="Remove this payment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Only show payment form if bill is not completed */}
        {bill.status !== "COMPLETED" && (
          <>
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

            <div className="space-y-2">
              <Label>Payment Received Date *</Label>
              <DateInput value={paymentDate} onChange={setPaymentDate} />
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {bill.status !== "COMPLETED" && (
            <Button onClick={handleComplete} disabled={completeBillMutation.isPending}>
              {completeBillMutation.isPending
                ? "Processing…"
                : previewRemaining > 0
                  ? "Record Payment"
                  : "Complete Bill"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
