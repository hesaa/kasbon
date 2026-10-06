import type { Debt } from "@/types/debt";

export interface CounterpartGroup {
  normalizedName: string;
  displayName: string;
  totalEntries: number;
  openOwedToMe: number;
  openIOwe: number;
  net: number;
}

export function groupByCounterpart(debts: Debt[]): CounterpartGroup[] {
  const map = new Map<string, CounterpartGroup>();

  for (const debt of debts) {
    const norm = debt.counterpart_name.trim().replace(/\s+/g, " ").toLowerCase();
    let group = map.get(norm);

    if (!group) {
      group = {
        normalizedName: norm,
        displayName: debt.counterpart_name.trim(),
        totalEntries: 0,
        openOwedToMe: 0,
        openIOwe: 0,
        net: 0,
      };
      map.set(norm, group);
    }

    group.totalEntries += 1;

    // Only unsettled debts count towards open totals
    if (!debt.settled_at) {
      if (debt.type === "owed_to_me") {
        group.openOwedToMe += debt.amount;
      } else {
        group.openIOwe += debt.amount;
      }
    }
  }

  for (const group of map.values()) {
    group.net = group.openOwedToMe - group.openIOwe;
  }

  return Array.from(map.values()).sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}
