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
import { useCreateCompany, useUpdateCompany } from "@/hooks/use-companies";
import type { Company } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Company name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
});

type FormValues = z.infer<typeof schema>;

export function CompanyForm({
  open,
  onOpenChange,
  company,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
}) {
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(company ? { name: company.name, phone: company.phone } : { name: "", phone: "" });
  }, [open, company, form]);

  const onSubmit = (values: FormValues) => {
    if (company) {
      updateCompany.mutate(
        { id: company.id, data: values },
        {
          onSuccess: () => {
            toast.success("Company updated successfully.");
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message || "Failed to update company."),
        },
      );
    } else {
      createCompany.mutate(values, {
        onSuccess: () => {
          toast.success("Company added successfully.");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message || "Failed to add company."),
      });
    }
  };

  const isPending = createCompany.isPending || updateCompany.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{company ? "Edit Company" : "Add Company"}</DialogTitle>
          <DialogDescription>
            {company ? "Update company information." : "Create a company to start adding bills."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC Technologies Pvt Ltd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" maxLength={10} placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : company ? "Save Changes" : "Add Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
