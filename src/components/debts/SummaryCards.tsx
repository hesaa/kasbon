import type { DebtSummary } from "@/types/debt";
import { formatRupiah } from "@/lib/format/rupiah";
import { COPY } from "@/lib/copy";
import { SummaryCardsSkeleton } from "@/components/ui/Skeleton";
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";

interface SummaryCardsProps {
  summary?: DebtSummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading || !summary) {
    return <SummaryCardsSkeleton />;
  }

  const isNetPositive = summary.net >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {/* 1. Total Dihutang ke saya */}
      <div className="order-2 sm:order-1 col-span-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
            {COPY.cardOwedToMe}
          </span>
          <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatRupiah(summary.owed_to_me)}
          </div>
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            {COPY.cardSubtextUnsettled.replace("{n}", String(summary.open_count))}
          </div>
        </div>
      </div>

      {/* 2. Total Saya Hutang */}
      <div className="order-3 sm:order-2 col-span-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
            {COPY.cardIOwe}
          </span>
          <div className="h-7 w-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatRupiah(summary.i_owe)}
          </div>
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            Hutang aktifmu
          </div>
        </div>
      </div>

      {/* 3. Net Hero Card (On top on mobile, 3rd column on desktop) */}
      <div
        className={`order-1 sm:order-3 col-span-2 sm:col-span-1 p-4.5 rounded-2xl border shadow-xs flex flex-col justify-between transition-colors ${
          isNetPositive
            ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100"
            : "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-100"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-bold uppercase tracking-tight ${
              isNetPositive ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
            }`}
          >
            {COPY.cardNet}
          </span>
          <div
            className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
              isNetPositive
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs"
                : "bg-rose-600 dark:bg-rose-500 text-white shadow-xs"
            }`}
          >
            {summary.net === 0 ? (
              <Scale className="h-4 w-4" />
            ) : isNetPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        </div>

        <div>
          <div
            className={`text-2xl sm:text-xl font-extrabold tabular-nums tracking-tight ${
              isNetPositive ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
            }`}
          >
            {summary.net > 0 ? "+" : ""}
            {formatRupiah(summary.net)}
          </div>
          <div
            className={`text-xs font-medium mt-1 ${
              isNetPositive ? "text-emerald-800 dark:text-emerald-200" : "text-rose-800 dark:text-rose-200"
            }`}
          >
            {isNetPositive ? COPY.cardNetPositive : COPY.cardNetNegative}
          </div>
        </div>
      </div>
    </div>
  );
}
