import { describe, it, expect } from "vitest";
import { computeNet } from "./summary";

describe("Net calculation logic", () => {
  it("computes net correctly", () => {
    expect(computeNet(1500000, 400000)).toBe(1100000);
    expect(computeNet(0, 500000)).toBe(-500000);
    expect(computeNet(0, 0)).toBe(0);
  });
});
