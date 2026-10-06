import { describe, it, expect } from "vitest";
import { formatRelativeDay, todayInJakarta } from "./relative-date";

describe("Relative date formatting in Asia/Jakarta timezone", () => {
  const mockNow = new Date("2026-10-06T10:00:00+07:00");

  it("todayInJakarta returns YYYY-MM-DD in WIB", () => {
    expect(todayInJakarta(mockNow)).toBe("2026-10-06");
  });

  it("formatRelativeDay calculates relative day names correctly", () => {
    expect(formatRelativeDay("2026-10-06", mockNow)).toBe("hari ini");
    expect(formatRelativeDay("2026-10-05", mockNow)).toBe("kemarin");
    expect(formatRelativeDay("2026-10-03", mockNow)).toBe("3 hari lalu");
    expect(formatRelativeDay("2026-09-29", mockNow)).toBe("1 minggu lalu");
    expect(formatRelativeDay("2026-09-07", mockNow)).toBe("4 minggu lalu");
    expect(formatRelativeDay("2026-09-06", mockNow)).toBe("1 bulan lalu");
    expect(formatRelativeDay("2026-07-08", mockNow)).toBe("3 bulan lalu");
    expect(formatRelativeDay("2025-10-06", mockNow)).toBe("1 tahun lalu");
    expect(formatRelativeDay("2026-10-07", mockNow)).toBe("besok");
    expect(formatRelativeDay("2026-10-09", mockNow)).toBe("3 hari lagi");
  });

  it("handles WIB midnight edge case correctly", () => {
    // 2026-10-05T18:30:00Z is 2026-10-06 01:30 AM in WIB
    const wibMidnightNow = new Date("2026-10-05T18:30:00Z");
    expect(todayInJakarta(wibMidnightNow)).toBe("2026-10-06");
    expect(formatRelativeDay("2026-10-06", wibMidnightNow)).toBe("hari ini");
  });
});
