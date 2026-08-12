import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, mapCompany } from "@/lib/api";
import type { Company } from "@/types";

export const companyKeys = {
  all: ["companies"] as const,
  list: () => ["companies", "list"] as const,
  detail: (id: string) => ["companies", "detail", id] as const,
};

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: async (): Promise<Company[]> => {
      const data = await api.getCompanies();
      return data.map(mapCompany);
    },
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const data = await api.getCompany(id);
      return mapCompany(data);
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; phone: string }) => api.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; phone: string } }) =>
      api.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
}
