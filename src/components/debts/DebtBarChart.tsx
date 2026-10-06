import type { DebtSummary } from "@/types/debt";
import { formatRupiah } from "@/lib/format/rupiah";
import { COPY } from "@/lib/copy";
import { BarChart3 } from "lucide-react";

interface DebtBarChartProps {
  summary?: DebtSummary;
}

export function DebtBarChart({ summary }: DebtBarChartProps) {
  if (!summary) return null;

  const owed = summary.owed_to_me;
  const owe = summary.i_owe;
  const maxVal = Math.max(owed, owe, 1);

  const owedPercent = Math.round((owed / maxVal) * 100);
  const owePercent = Math.round((owe / maxVal) * 100);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <BarChart3 className="h-4 w-4 text-indigo-600" />
        <h3 className="font-bold text-sm text-slate-900">
          Grafik Perbandingan: Dihutang vs Hutang
        </h3>
      </div>

      <div
        aria-label={`Grafik perbandingan: Total dihutang ke saya ${formatRupiah(owed)}, Total saya hutang ${formatRupiah(owe)}`}
        className="space-y-4"
      >
        {/* Bar 1: Dihutang ke saya */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>{COPY.cardOwedToMe}</span>
            <span className="text-emerald-700 tabular-nums">{formatRupiah(owed)}</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${owedPercent}%` }}
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            />
          </div>
        </div>

        {/* Bar 2: Saya hutang */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>{COPY.cardIOwe}</span>
            <span className="text-rose-700 tabular-nums">{formatRupiah(owe)}</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${owePercent}%` }}
              className="h-full bg-rose-600 rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
