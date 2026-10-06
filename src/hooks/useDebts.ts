import { useQuery } from "@tanstack/react-query";
import { apiFetch, type DebtsResponse } from "@/lib/api/client";
import type { DebtFilters } from "@/lib/debts/filters";

export function useDebts(filters: DebtFilters, userEmail?: string) {
  const queryParams = new URLSearchParams();
  if (filters.status !== "all") queryParams.set("status", filters.status);
  if (filters.type !== "all") queryParams.set("type", filters.type);
  if (filters.q) queryParams.set("q", filters.q);
  if (filters.sort !== "date") queryParams.set("sort", filters.sort);
  if (filters.order !== "desc") queryParams.set("order", filters.order);

  const queryString = queryParams.toString();
  const url = `/api/debts${queryString ? `?${queryString}` : ""}`;

  return useQuery<DebtsResponse>({
    queryKey: ["debts", userEmail || "anonymous", filters],
    queryFn: () => apiFetch<DebtsResponse>(url),
  });
}
