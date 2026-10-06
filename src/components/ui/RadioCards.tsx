import type { DebtType } from "@/types/debt";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { COPY } from "@/lib/copy";

interface RadioCardsProps {
  value: DebtType;
  onChange: (val: DebtType) => void;
  label?: string;
}

export function RadioCards({ value, onChange, label }: RadioCardsProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("owed_to_me")}
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            value === "owed_to_me"
              ? "border-emerald-500 dark:border-emerald-500/80 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 text-emerald-950 dark:text-emerald-100 shadow-xs"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
              value === "owed_to_me"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">{COPY.formRadioOwedToMe}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Orang utang ke kamu</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange("i_owe")}
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            value === "i_owe"
              ? "border-rose-500 dark:border-rose-500/80 bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-rose-500/20 text-rose-950 dark:text-rose-100 shadow-xs"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
              value === "i_owe"
                ? "bg-rose-600 dark:bg-rose-500 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">{COPY.formRadioIOwe}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Kamu utang ke orang</div>
          </div>
        </button>
      </div>
    </div>
  );
}
