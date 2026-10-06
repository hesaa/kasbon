import { describe, it, expect } from "vitest";
import { parseDebtFilters, DEFAULT_FILTERS } from "./filters";

describe("Debt filter parsing logic", () => {
  it("falls back to default filters when params are empty or invalid", () => {
    expect(parseDebtFilters({})).toEqual(DEFAULT_FILTERS);
    expect(parseDebtFilters({ status: "invalid", type: "invalid" })).toEqual(DEFAULT_FILTERS);
  });

  it("parses valid filter query parameters correctly", () => {
    expect(
      parseDebtFilters({
        status: "unsettled",
        type: "owed_to_me",
        q: "Budi",
        sort: "amount",
        order: "asc",
      })
    ).toEqual({
      status: "unsettled",
      type: "owed_to_me",
      q: "Budi",
      sort: "amount",
      order: "asc",
    });
  });
});
