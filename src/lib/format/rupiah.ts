const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

export function formatRupiah(n: number): string {
  if (isNaN(n) || !isFinite(n)) return "Rp 0";
  return `${n < 0 ? "-" : ""}Rp ${nf.format(Math.abs(n))}`;
}

export function parseRupiahInput(raw: string): number | null {
  if (!raw) return null;
  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.length === 0) return null;
  const parsed = parseInt(digitsOnly, 10);
  return isNaN(parsed) ? null : parsed;
}

export function formatRupiahInput(raw: string): string {
  const parsed = parseRupiahInput(raw);
  if (parsed === null) return "";
  return nf.format(parsed);
}
