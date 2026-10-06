import type { Debt } from "@/types/debt";
import { groupByCounterpart } from "@/lib/debts/group";
import { formatRupiah } from "@/lib/format/rupiah";
import { ArrowDownLeft, ArrowUpRight, Users } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

interface CounterpartGroupListProps {
  debts?: Debt[];
}

export function CounterpartGroupList({ debts }: CounterpartGroupListProps) {
  if (!debts || debts.length === 0) {

    return (
      <EmptyState
        type="empty"
      />
    );
  }

  const groups = groupByCounterpart(debts);
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" />
          <span className="font-bold text-sm text-slate-900">
            Ringkasan Per Orang ({groups.length})
          </span>
        </div>
      </div>

      {groups.map((group) => {
        const isNetPositive = group.net >= 0;

        return (
          <div key={group.normalizedName} className="p-4 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <h4 className="font-semibold text-sm text-slate-900 truncate">
                {group.displayName}
              </h4>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{group.totalEntries} catatan</span>
                {group.openOwedToMe > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium">
                    <ArrowDownLeft className="h-3 w-3" />
                    {formatRupiah(group.openOwedToMe)}
                  </span>
                )}
                {group.openIOwe > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-rose-700 font-medium">
                    <ArrowUpRight className="h-3 w-3" />
                    {formatRupiah(group.openIOwe)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-slate-400 block font-medium">Net</span>
              <span
                className={`font-bold text-sm sm:text-base tabular-nums ${isNetPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
              >
                {group.net > 0 ? "+" : ""}
                {formatRupiah(group.net)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
