import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, type DebtDeleteResponse } from "@/lib/api/client";
import { COPY } from "@/lib/copy";

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<DebtDeleteResponse>(`/api/debts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success(COPY.toastDeleted);
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || COPY.toastError);
    },
  });
}
