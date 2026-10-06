import type { DebtType } from "@/types/debt";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { COPY } from "@/lib/copy";

interface BadgeProps {
  type?: DebtType;
  status?: "settled" | "unsettled" | "overdue";
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ type, status, children, className = "" }: BadgeProps) {
  if (type) {
    const isOwed = type === "owed_to_me";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isOwed
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
            : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
        } ${className}`}
      >
        {isOwed ? (
          <ArrowDownLeft className="h-3 w-3 shrink-0" />
        ) : (
          <ArrowUpRight className="h-3 w-3 shrink-0" />
        )}
        <span>{isOwed ? COPY.typeOwedToMe : COPY.typeIOwe}</span>
      </span>
    );
  }

  if (status === "settled") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
      >
        <CheckCircle2 className="h-3 w-3 text-slate-500 dark:text-slate-400 shrink-0" />
        <span>{COPY.statusSettled}</span>
      </span>
    );
  }

  if (status === "unsettled") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 ${className}`}
      >
        <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400 shrink-0" />
        <span>{COPY.statusUnsettled}</span>
      </span>
    );
  }

  if (status === "overdue") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 ${className}`}
      >
        <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" />
        <span>{COPY.statusOverdue}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
    >
      {children}
    </span>
  );
}
