import type { Debt } from "@/types/debt";
import { formatRupiah } from "@/lib/format/rupiah";
import { formatRelativeDay, formatAbsoluteDate, todayInJakarta } from "@/lib/format/relative-date";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Undo2, Pencil, Trash2, Loader2 } from "lucide-react";
import { COPY } from "@/lib/copy";

interface DebtItemProps {
  debt: Debt;
  onToggleSettled: (id: string, currentSettled: boolean) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  isMutating?: boolean;
}

export function DebtItem({
  debt,
  onToggleSettled,
  onEdit,
  onDelete,
  isMutating = false,
}: DebtItemProps) {
  const isSettled = Boolean(debt.settled_at);
  const isOwedToMe = debt.type === "owed_to_me";

  const today = todayInJakarta();
  const isOverdue =
    !isSettled && Boolean(debt.due_date) && (debt.due_date as string) < today;

  const initialLetter = debt.counterpart_name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`p-4 transition-all ${
        isSettled
          ? "bg-slate-50/50 dark:bg-slate-900/40 opacity-70"
          : "bg-white dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
              isOwedToMe
                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300"
            }`}
          >
            {initialLetter}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                {debt.counterpart_name}
              </h4>
              {isOverdue && <Badge status="overdue" />}
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
              <Badge type={debt.type} />
              <Badge status={isSettled ? "settled" : "unsettled"} />
              <span
                title={formatAbsoluteDate(debt.debt_date)}
                className="text-xs text-slate-500 dark:text-slate-400 font-medium"
              >
                {formatRelativeDay(debt.debt_date)}
              </span>
            </div>

            {debt.note && (
              <p
                title={debt.note}
                className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md italic mt-0.5"
              >
                &quot;{debt.note}&quot;
              </p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className={`font-bold text-base sm:text-lg tabular-nums tracking-tight ${
              isSettled
                ? "line-through text-slate-400 dark:text-slate-600"
                : isOwedToMe
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isOwedToMe ? "+" : "−"}
            {formatRupiah(debt.amount)}
          </div>

          {debt.due_date && !isSettled && (
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Jatuh tempo: {formatRelativeDay(debt.due_date)}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/80 dark:border-slate-800/80">
        <Button
          type="button"
          variant={isSettled ? "ghost" : "primary"}
          size="sm"
          onClick={() => onToggleSettled(debt.id, isSettled)}
          disabled={isMutating}
          className="text-xs"
        >
          {isMutating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isSettled ? (
            <Undo2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          <span>{isSettled ? COPY.actionUndoSettled : COPY.actionMarkSettled}</span>
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(debt)}
            disabled={isMutating}
            aria-label={`${COPY.actionEdit} ${debt.counterpart_name}`}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(debt)}
            disabled={isMutating}
            aria-label={`${COPY.actionDelete} ${debt.counterpart_name}`}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
