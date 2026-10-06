export type StatusFilter = "all" | "unsettled" | "settled";
export type TypeFilter = "all" | "owed_to_me" | "i_owe";
export type SortOption = "date" | "amount";
export type SortOrder = "asc" | "desc";

export interface DebtFilters {
  status: StatusFilter;
  type: TypeFilter;
  q: string;
  sort: SortOption;
  order: SortOrder;
}

export const DEFAULT_FILTERS: DebtFilters = {
  status: "all",
  type: "all",
  q: "",
  sort: "date",
  order: "desc",
};

export function parseDebtFilters(
  params: Record<string, string | string[] | undefined>
): DebtFilters {
  const statusParam = typeof params.status === "string" ? params.status : undefined;
  const typeParam = typeof params.type === "string" ? params.type : undefined;
  const qParam = typeof params.q === "string" ? params.q.slice(0, 100) : undefined;
  const sortParam = typeof params.sort === "string" ? params.sort : undefined;
  const orderParam = typeof params.order === "string" ? params.order : undefined;

  const status: StatusFilter =
    statusParam === "unsettled" || statusParam === "settled" ? statusParam : "all";
  const type: TypeFilter =
    typeParam === "owed_to_me" || typeParam === "i_owe" ? typeParam : "all";
  const sort: SortOption = sortParam === "amount" ? "amount" : "date";
  const order: SortOrder = orderParam === "asc" ? "asc" : "desc";

  return {
    status,
    type,
    q: qParam || "",
    sort,
    order,
  };
}
