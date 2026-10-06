import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, type DebtSingleResponse, type DebtsResponse } from "@/lib/api/client";
import { COPY } from "@/lib/copy";

interface ToggleSettledVariables {
  id: string;
  settled: boolean;
}

export function useToggleSettled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, settled }: ToggleSettledVariables) =>
      apiFetch<DebtSingleResponse>(`/api/debts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ settled }),
      }),
    onMutate: async ({ id, settled }) => {
      await queryClient.cancelQueries({ queryKey: ["debts"] });

      const previousQueries = queryClient.getQueriesData<DebtsResponse>({
        queryKey: ["debts"],
      });

      queryClient.setQueriesData<DebtsResponse>({ queryKey: ["debts"] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                settled_at: settled ? new Date().toISOString() : null,
              };
            }
            return item;
          }),
        };
      });

      return { previousQueries };
    },
    onError: (err: { message?: string }, _variables, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(err?.message || COPY.toastError);
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.settled ? COPY.toastSettled : COPY.toastUnsettled);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}
