import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, mapBill } from "@/lib/api";
import type { Bill } from "@/types";

export const billKeys = {
  all: ["bills"] as const,
  list: (params?: { status?: string; companyId?: string }) => ["bills", "list", params] as const,
  detail: (id: string) => ["bills", "detail", id] as const,
  stats: () => ["bills", "stats"] as const,
};

export function useBills(params?: { status?: string; companyId?: string }) {
  return useQuery({
    queryKey: billKeys.list(params),
    queryFn: async (): Promise<Bill[]> => {
      const data = await api.getBills(params);
      return data.map(mapBill);
    },
  });
}

export function useBillStats() {
  return useQuery({
    queryKey: billKeys.stats(),
    queryFn: () => api.getBillStats(),
  });
}

export function useBill(id: string) {
  return useQuery({
    queryKey: billKeys.detail(id),
    queryFn: async () => {
      const data = await api.getBill(id);
      return mapBill(data);
    },
    enabled: !!id,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { companyId: string; invoiceNumber: string; totalAmount: number; billDate: string }) =>
      api.createBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { companyId: string; invoiceNumber: string; totalAmount: number; billDate: string } }) =>
      api.updateBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
    },
  });
}

export function useCompleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentMethod, paidAmount }: { id: string; paymentMethod: string; paidAmount?: number }) =>
      api.completeBill(id, paymentMethod, paidAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
    },
  });
}
