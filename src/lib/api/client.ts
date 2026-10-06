import type { Debt, DebtSummary } from "@/types/debt";

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiFetch<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = json?.error;
    throw new ApiClientError(
      res.status,
      errorBody?.code || "UNKNOWN_ERROR",
      errorBody?.message || "Terjadi kesalahan. Coba lagi ya.",
      errorBody?.fields
    );
  }

  return json as T;
}

export interface DebtsResponse {
  data: Debt[];
  summary: DebtSummary;
}

export interface DebtSingleResponse {
  data: Debt;
}

export interface DebtDeleteResponse {
  data: {
    id: string;
  };
}
