import { describe, it, expect } from "vitest";
import { groupByCounterpart } from "./group";
import type { Debt } from "@/types/debt";

describe("GroupByCounterpart logic", () => {
  it("groups counterpart names normalizing spaces and case", () => {
    const mockDebts: Debt[] = [
      {
        id: "1",
        type: "owed_to_me",
        counterpart_name: "Budi",
        amount: 250000,
        note: null,
        debt_date: "2026-10-06",
        due_date: null,
        settled_at: null,
        created_at: "2026-10-06T00:00:00Z",
        updated_at: "2026-10-06T00:00:00Z",
      },
      {
        id: "2",
        type: "i_owe",
        counterpart_name: " budi ",
        amount: 50000,
        note: null,
        debt_date: "2026-10-06",
        due_date: null,
        settled_at: null,
        created_at: "2026-10-06T00:00:00Z",
        updated_at: "2026-10-06T00:00:00Z",
      },
      {
        id: "3",
        type: "owed_to_me",
        counterpart_name: "BUDI",
        amount: 100000,
        note: null,
        debt_date: "2026-10-06",
        due_date: null,
        settled_at: "2026-10-06T10:00:00Z", // settled -> should not add to open total
        created_at: "2026-10-06T00:00:00Z",
        updated_at: "2026-10-06T00:00:00Z",
      },
    ];

    const result = groupByCounterpart(mockDebts);
    expect(result.length).toBe(1);
    expect(result[0]?.displayName).toBe("Budi");
    expect(result[0]?.totalEntries).toBe(3);
    expect(result[0]?.openOwedToMe).toBe(250000);
    expect(result[0]?.openIOwe).toBe(50000);
    expect(result[0]?.net).toBe(200000);
  });
});
