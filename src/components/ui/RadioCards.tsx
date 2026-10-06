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
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("owed_to_me")}
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            value === "owed_to_me"
              ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
          }`}
        >
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
              value === "owed_to_me"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">{COPY.formRadioOwedToMe}</div>
            <div className="text-[11px] text-slate-500">Orang utang ke kamu</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange("i_owe")}
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            value === "i_owe"
              ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 text-rose-950 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
          }`}
        >
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
              value === "i_owe" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold">{COPY.formRadioIOwe}</div>
            <div className="text-[11px] text-slate-500">Kamu utang ke orang</div>
          </div>
        </button>
      </div>
    </div>
  );
}
