"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { parseDebtFilters, type DebtFilters } from "@/lib/debts/filters";

export function useDebtFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawObj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    rawObj[key] = value;
  });

  const filters = parseDebtFilters(rawObj);

  const setFilters = (newFilters: Partial<DebtFilters>) => {
    const updated = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (updated.status !== "all") params.set("status", updated.status);
    if (updated.type !== "all") params.set("type", updated.type);
    if (updated.q) params.set("q", updated.q);
    if (updated.sort !== "date") params.set("sort", updated.sort);
    if (updated.order !== "desc") params.set("order", updated.order);

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  const resetFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const isFiltered =
    filters.status !== "all" ||
    filters.type !== "all" ||
    Boolean(filters.q) ||
    filters.sort !== "date" ||
    filters.order !== "desc";

  return { filters, setFilters, resetFilters, isFiltered };
}
