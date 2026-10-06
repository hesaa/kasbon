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
      <div className="order-2 sm:order-1 col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
            {COPY.cardOwedToMe}
          </span>
          <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
            {formatRupiah(summary.owed_to_me)}
          </div>
          <div className="text-[11px] font-medium text-slate-400 mt-0.5">
            {COPY.cardSubtextUnsettled.replace("{n}", String(summary.open_count))}
          </div>
        </div>
      </div>

      {/* 2. Total Saya Hutang */}
      <div className="order-3 sm:order-2 col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
            {COPY.cardIOwe}
          </span>
          <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
            {formatRupiah(summary.i_owe)}
          </div>
          <div className="text-[11px] font-medium text-slate-400 mt-0.5">
            Hutang aktifmu
          </div>
        </div>
      </div>

      {/* 3. Net Hero Card (On top on mobile, 3rd column on desktop) */}
      <div
        className={`order-1 sm:order-3 col-span-2 sm:col-span-1 p-4.5 rounded-2xl border shadow-xs flex flex-col justify-between transition-colors ${
          isNetPositive
            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
            : "bg-rose-50/70 border-rose-200 text-rose-950"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-bold uppercase tracking-tight ${
              isNetPositive ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {COPY.cardNet}
          </span>
          <div
            className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
              isNetPositive
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-rose-600 text-white shadow-xs"
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
              isNetPositive ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {summary.net > 0 ? "+" : ""}
            {formatRupiah(summary.net)}
          </div>
          <div
            className={`text-xs font-medium mt-1 ${
              isNetPositive ? "text-emerald-800" : "text-rose-800"
            }`}
          >
            {isNetPositive ? COPY.cardNetPositive : COPY.cardNetNegative}
          </div>
        </div>
      </div>
    </div>
  );
}
