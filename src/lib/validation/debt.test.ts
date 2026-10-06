import { describe, it, expect } from "vitest";
import { debtSchema } from "./debt";

describe("Debt Zod validation schema", () => {
  it("validates a valid debt payload", () => {
    const validData = {
      type: "owed_to_me",
      counterpart_name: "Budi",
      amount: 250000,
      debt_date: "2026-10-06",
      due_date: "2026-10-10",
      note: "Patungan makan malam",
    };

    const result = debtSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects empty counterpart name", () => {
    const invalidData = {
      type: "owed_to_me",
      counterpart_name: "  ",
      amount: 100000,
      debt_date: "2026-10-06",
    };

    const result = debtSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects amount exceeding 1 trillion or negative", () => {
    expect(
      debtSchema.safeParse({
        type: "owed_to_me",
        counterpart_name: "Budi",
        amount: 2_000_000_000_000,
        debt_date: "2026-10-06",
      }).success
    ).toBe(false);

    expect(
      debtSchema.safeParse({
        type: "owed_to_me",
        counterpart_name: "Budi",
        amount: -500,
        debt_date: "2026-10-06",
      }).success
    ).toBe(false);
  });

  it("rejects due_date earlier than debt_date", () => {
    const result = debtSchema.safeParse({
      type: "owed_to_me",
      counterpart_name: "Budi",
      amount: 100000,
      debt_date: "2026-10-06",
      due_date: "2026-10-01",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Jatuh tempo nggak boleh sebelum tanggal catat"
      );
    }
  });
});
