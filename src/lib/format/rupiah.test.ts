import { describe, it, expect } from "vitest";
import { formatRupiah, parseRupiahInput, formatRupiahInput } from "./rupiah";

describe("Rupiah formatting logic", () => {
  it("formatRupiah formats whole numbers deterministically", () => {
    expect(formatRupiah(0)).toBe("Rp 0");
    expect(formatRupiah(1000)).toBe("Rp 1.000");
    expect(formatRupiah(1234000)).toBe("Rp 1.234.000");
    expect(formatRupiah(1000000000)).toBe("Rp 1.000.000.000");
    expect(formatRupiah(-500000)).toBe("-Rp 500.000");
  });

  it("parseRupiahInput strips non-digits correctly", () => {
    expect(parseRupiahInput("1.234.000")).toBe(1234000);
    expect(parseRupiahInput("Rp 5.000")).toBe(5000);
    expect(parseRupiahInput("0012")).toBe(12);
    expect(parseRupiahInput("")).toBeNull();
    expect(parseRupiahInput("abc")).toBeNull();
  });

  it("formatRupiahInput formats input digits with thousand separators", () => {
    expect(formatRupiahInput("1234000")).toBe("1.234.000");
    expect(formatRupiahInput("abc")).toBe("");
  });
});
