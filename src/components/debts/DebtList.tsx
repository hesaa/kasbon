import type { Debt } from "@/types/debt";
import { DebtItem } from "./DebtItem";
import { DebtListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface DebtListProps {
  debts?: Debt[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  isFiltered?: boolean;
  onRetry?: () => void;
  onResetFilters?: () => void;
  onNewDebtClick?: () => void;
  onToggleSettled: (id: string, currentSettled: boolean) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

export function DebtList({
  debts,
  isLoading,
  isError,
  errorMessage,
  isFiltered,
  onRetry,
  onResetFilters,
  onNewDebtClick,
  onToggleSettled,
  onEdit,
  onDelete,
}: DebtListProps) {
  if (isLoading) {
    return <DebtListSkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        type="error"
        errorMessage={errorMessage}
        onAction={onRetry}
      />
    );
  }

  if (!debts || debts.length === 0) {
    if (isFiltered) {
      return (
        <EmptyState
          type="filtered"
          onAction={onResetFilters}
        />
      );
    }
    return (
      <EmptyState
        type="empty"
        onAction={onNewDebtClick}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100/80 dark:divide-slate-800/80 overflow-hidden">
      {debts.map((debt) => (
        <DebtItem
          key={debt.id}
          debt={debt}
          onToggleSettled={onToggleSettled}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
