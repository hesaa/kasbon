"use client";

import { useState, useEffect } from "react";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type {
  DebtFilters as FiltersType,
  StatusFilter,
  TypeFilter,
  SortOption,
  SortOrder,
} from "@/lib/debts/filters";
import { COPY } from "@/lib/copy";

interface DebtFiltersProps {
  filters: FiltersType;
  onFilterChange: (updated: Partial<FiltersType>) => void;
  onReset: () => void;
  isFiltered: boolean;
  onNewDebtClick: () => void;
}

export function DebtFilters({
  filters,
  onFilterChange,
  onReset,
  isFiltered,
  onNewDebtClick,
}: DebtFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.q);
  const [prevFilterQ, setPrevFilterQ] = useState(filters.q);
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync state during rendering when prop changes externally (e.g. reset)
  if (filters.q !== prevFilterQ) {
    setPrevFilterQ(filters.q);
    setSearchInput(filters.q);
  }

  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      onFilterChange({ q: debouncedSearch });
    }
  }, [debouncedSearch, filters.q, onFilterChange]);

  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={COPY.searchPlaceholder}
            className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50 min-h-[40px]"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-label="Toggle filter opsi"
          className={`h-10 w-10 sm:hidden rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
            showAdvanced || isFiltered
              ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        <div className="hidden sm:block">
          <Button variant="primary" size="md" onClick={onNewDebtClick}>
            <span>{COPY.actionNewDebt}</span>
          </Button>
        </div>
      </div>

      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 sm:flex ${showAdvanced ? "block" : "hidden sm:grid"}`}>
        <Select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({ status: e.target.value as StatusFilter })
          }
          className="!min-h-[38px] !py-1.5 text-xs"
        >
          <option value="all">{COPY.filterStatusAll}</option>
          <option value="unsettled">{COPY.statusUnsettled}</option>
          <option value="settled">{COPY.statusSettled}</option>
        </Select>

        <Select
          value={filters.type}
          onChange={(e) =>
            onFilterChange({ type: e.target.value as TypeFilter })
          }
          className="!min-h-[38px] !py-1.5 text-xs"
        >
          <option value="all">{COPY.filterTypeAll}</option>
          <option value="owed_to_me">{COPY.typeOwedToMe}</option>
          <option value="i_owe">{COPY.typeIOwe}</option>
        </Select>

        <Select
          value={`${filters.sort}-${filters.order}`}
          onChange={(e) => {
            const parts = e.target.value.split("-");
            const sort = parts[0] as SortOption;
            const order = parts[1] as SortOrder;
            onFilterChange({ sort, order });
          }}
          className="!min-h-[38px] !py-1.5 text-xs"
        >
          <option value="date-desc">Terbaru</option>
          <option value="date-asc">Terlama</option>
          <option value="amount-desc">Nominal terbesar</option>
          <option value="amount-asc">Nominal terkecil</option>
        </Select>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="col-span-1 inline-flex items-center justify-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{COPY.filterReset}</span>
          </button>
        )}
      </div>
    </div>
  );
}
