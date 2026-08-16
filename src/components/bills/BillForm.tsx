import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/common/DateInput";
import { useCompanies } from "@/hooks/use-companies";
import { useCreateBill, useUpdateBill } from "@/hooks/use-bills";
import { toDateInput } from "@/lib/format";
import type { Bill } from "@/types";

const schema = z.object({
  companyId: z.string().min(1, "Company is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  totalAmount: z.coerce.number().gt(0, "Amount must be greater than 0"),
  billDate: z.string().min(1, "Bill date is required"),
});

type FormValues = z.input<typeof schema>;

export function BillForm({
  open,
  onOpenChange,
  bill,
  defaultCompanyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null | undefined;
  defaultCompanyId?: string | undefined;
}) {
  const { data: companies = [] } = useCompanies();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: defaultCompanyId ?? "",
      invoiceNumber: "",
      totalAmount: "" as unknown as number,
      billDate: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      bill
        ? {
            companyId: bill.companyId,
            invoiceNumber: bill.invoiceNumber,
            totalAmount: bill.totalAmount,
            billDate: toDateInput(bill.billDate),
          }
        : {
            companyId: defaultCompanyId ?? "",
            invoiceNumber: "",
            totalAmount: "" as unknown as number,
            billDate: "",
          },
    );
  }, [open, bill, defaultCompanyId, form]);

  const onSubmit = (values: FormValues) => {
    const parsed = schema.parse(values);
    if (bill) {
      updateBill.mutate(
        { id: bill.id, data: parsed },
        {
          onSuccess: () => {
            toast.success("Bill updated successfully.");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message || "Failed to update bill."),
        },
      );
    } else {
      createBill.mutate(parsed, {
        onSuccess: () => {
          toast.success("Bill added successfully.");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Failed to add bill."),
      });
    }
  };

  const isPending = createBill.isPending || updateBill.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{bill ? "Edit Bill" : "Add Bill"}</DialogTitle>
          <DialogDescription>
            {bill
              ? "Update the details of this pending bill."
              : "New bills are created as pending with no payment method."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="INV-5001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount (₹) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="75000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date *</FormLabel>
                    <FormControl>
                      <DateInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : bill ? "Save Changes" : "Add Bill"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
