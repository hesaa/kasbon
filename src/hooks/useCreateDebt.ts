import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, type DebtSingleResponse } from "@/lib/api/client";
import type { CreateDebtInput } from "@/lib/validation/debt";
import { COPY } from "@/lib/copy";

export function useCreateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDebtInput) =>
      apiFetch<DebtSingleResponse>("/api/debts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success(COPY.toastCreated);
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || COPY.toastError);
    },
  });
}
