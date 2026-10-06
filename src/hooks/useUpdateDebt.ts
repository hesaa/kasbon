import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, type DebtSingleResponse } from "@/lib/api/client";
import type { UpdateDebtInput } from "@/lib/validation/debt";
import { COPY } from "@/lib/copy";

export function useUpdateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDebtInput }) =>
      apiFetch<DebtSingleResponse>(`/api/debts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success(COPY.toastUpdated);
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || COPY.toastError);
    },
  });
}
