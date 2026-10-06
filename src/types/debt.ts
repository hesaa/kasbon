export type DebtType = "owed_to_me" | "i_owe";

export interface Debt {
  id: string;
  type: DebtType;
  counterpart_name: string;
  amount: number;            // whole Rupiah
  note: string | null;
  debt_date: string;         // "YYYY-MM-DD"
  due_date: string | null;   // "YYYY-MM-DD"
  settled_at: string | null; // ISO timestamp; null = belum lunas
  created_at: string;
  updated_at: string;
}

export interface DebtSummary {
  owed_to_me: number;
  i_owe: number;
  net: number;               // owed_to_me - i_owe
  open_count: number;
}

export const DEBT_COLUMNS = "id, type, counterpart_name, amount, note, debt_date, due_date, settled_at, created_at, updated_at";
