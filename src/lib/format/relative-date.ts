export function todayInJakarta(now: Date = new Date()): string {
  // "en-CA" outputs YYYY-MM-DD format
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function parseUtcDateString(isoDateStr: string): number {
  const parts = isoDateStr.split("-").map((p) => parseInt(p, 10));
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return Date.UTC(year, month - 1, day);
}

export function formatRelativeDay(
  isoDateStr: string,
  now: Date = new Date()
): string {
  const todayStr = todayInJakarta(now);
  const targetUtc = parseUtcDateString(isoDateStr);
  const todayUtc = parseUtcDateString(todayStr);

  const diffMs = todayUtc - targetUtc;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "hari ini";
  if (diffDays === 1) return "kemarin";
  if (diffDays >= 2 && diffDays <= 6) return `${diffDays} hari lalu`;
  if (diffDays >= 7 && diffDays <= 29) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays >= 30 && diffDays <= 364) return `${Math.floor(diffDays / 30)} bulan lalu`;
  if (diffDays >= 365) return `${Math.floor(diffDays / 365)} tahun lalu`;

  if (diffDays === -1) return "besok";
  if (diffDays <= -2) return `${Math.abs(diffDays)} hari lagi`;

  return isoDateStr;
}

export function formatAbsoluteDate(isoDateStr: string): string {
  if (!isoDateStr) return "";
  const parts = isoDateStr.split("-").map((p) => parseInt(p, 10));
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(dateObj);
}
