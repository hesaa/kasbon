import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { ApiError, handleApiRoute } from "@/lib/api/errors";
import { debtSchema } from "@/lib/validation/debt";
import { DEBT_COLUMNS, type Debt, type DebtSummary } from "@/types/debt";
import { computeNet } from "@/lib/debts/summary";

function escapeIlike(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}

export const GET = handleApiRoute(async (request: Request) => {
  const { supabase } = await requireUser();
  const url = new URL(request.url);

  const status = url.searchParams.get("status") || "all";
  const type = url.searchParams.get("type") || "all";
  const q = url.searchParams.get("q") || "";
  const sort = url.searchParams.get("sort") || "date";
  const order = url.searchParams.get("order") || "desc";

  if (!["all", "unsettled", "settled"].includes(status)) {
    throw new ApiError(400, "BAD_REQUEST", "Parameter status nggak valid.");
  }
  if (!["all", "owed_to_me", "i_owe"].includes(type)) {
    throw new ApiError(400, "BAD_REQUEST", "Parameter type nggak valid.");
  }
  if (!["date", "amount"].includes(sort)) {
    throw new ApiError(400, "BAD_REQUEST", "Parameter sort nggak valid.");
  }
  if (!["asc", "desc"].includes(order)) {
    throw new ApiError(400, "BAD_REQUEST", "Parameter order nggak valid.");
  }

  const { data: summaryRpc, error: summaryError } = await supabase.rpc(
    "debt_summary"
  );

  if (summaryError) {
    throw new ApiError(500, "INTERNAL_ERROR", "Gagal mengambil ringkasan utang.");
  }

  const rawSummary = summaryRpc?.[0] || { owed_to_me: 0, i_owe: 0, open_count: 0 };
  const owedToMe = Number(rawSummary.owed_to_me || 0);
  const iOwe = Number(rawSummary.i_owe || 0);
  const openCount = Number(rawSummary.open_count || 0);

  const summary: DebtSummary = {
    owed_to_me: owedToMe,
    i_owe: iOwe,
    net: computeNet(owedToMe, iOwe),
    open_count: openCount,
  };

  let query = supabase
    .from("debts")
    .select(DEBT_COLUMNS);

  if (status === "unsettled") {
    query = query.is("settled_at", null);
  } else if (status === "settled") {
    query = query.not("settled_at", "is", null);
  }

  if (type !== "all") {
    query = query.eq("type", type as "owed_to_me" | "i_owe");
  }

  if (q.trim()) {
    query = query.ilike("counterpart_name", `%${escapeIlike(q.trim())}%`);
  }

  const isAsc = order === "asc";
  if (sort === "amount") {
    query = query.order("amount", { ascending: isAsc }).order("created_at", { ascending: false });
  } else {
    query = query.order("debt_date", { ascending: isAsc }).order("created_at", { ascending: false });
  }

  query = query.limit(500);

  const { data: debts, error: debtsError } = await query;

  if (debtsError) {
    throw new ApiError(500, "INTERNAL_ERROR", "Gagal mengambil daftar utang.");
  }

  return NextResponse.json(
    {
      data: (debts as unknown as Debt[]) || [],
      summary,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
});

export const POST = handleApiRoute(async (request: Request) => {
  const { supabase, userId } = await requireUser();

  const body = await request.json().catch(() => {
    throw new ApiError(400, "BAD_REQUEST", "Request-nya nggak valid (JSON error).");
  });

  const validated = debtSchema.parse(body);

  const { data: newDebt, error } = await supabase
    .from("debts")
    .insert({
      user_id: userId,
      type: validated.type,
      counterpart_name: validated.counterpart_name,
      amount: validated.amount,
      debt_date: validated.debt_date,
      due_date: validated.due_date,
      note: validated.note,
    })
    .select(DEBT_COLUMNS)
    .single();

  if (error || !newDebt) {
    throw new ApiError(500, "INTERNAL_ERROR", "Gagal menambah catatan utang.");
  }

  return NextResponse.json(
    { data: newDebt as unknown as Debt },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
});
