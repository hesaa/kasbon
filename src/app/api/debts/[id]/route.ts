import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { ApiError, handleApiRoute } from "@/lib/api/errors";
import { updateDebtSchema } from "@/lib/validation/debt";
import { DEBT_COLUMNS, type Debt } from "@/types/debt";
import type { Database } from "@/types/database.types";

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const PATCH = handleApiRoute(
  async (request: Request, context: RouteContext) => {
    const { id } = await context.params;

    if (!UUID_REGEX.test(id)) {
      throw new ApiError(400, "BAD_REQUEST", "ID catatan nggak valid.");
    }

    const { supabase, userId } = await requireUser();

    const body = await request.json().catch(() => {
      throw new ApiError(400, "BAD_REQUEST", "Request-nya nggak valid (JSON error).");
    });

    const validated = updateDebtSchema.parse(body);

    const updatePayload: Database["public"]["Tables"]["debts"]["Update"] = {};

    if (validated.type !== undefined) updatePayload.type = validated.type;
    if (validated.counterpart_name !== undefined)
      updatePayload.counterpart_name = validated.counterpart_name;
    if (validated.amount !== undefined) updatePayload.amount = validated.amount;
    if (validated.debt_date !== undefined) updatePayload.debt_date = validated.debt_date;
    if (validated.due_date !== undefined) updatePayload.due_date = validated.due_date;
    if (validated.note !== undefined) updatePayload.note = validated.note;

    if (validated.settled !== undefined) {
      updatePayload.settled_at = validated.settled ? new Date().toISOString() : null;
    }

    if (Object.keys(updatePayload).length === 0) {
      throw new ApiError(
        422,
        "VALIDATION_ERROR",
        "Harus ada minimal satu data yang diubah."
      );
    }

    const { data: updatedDebt, error } = await supabase
      .from("debts")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", userId)
      .select(DEBT_COLUMNS)
      .maybeSingle();

    if (error) {
      throw new ApiError(500, "INTERNAL_ERROR", "Gagal memperbarui catatan utang.");
    }

    if (!updatedDebt) {
      throw new ApiError(404, "NOT_FOUND", "Catatan nggak ditemukan.");
    }

    return NextResponse.json(
      { data: updatedDebt as unknown as Debt },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
);

export const DELETE = handleApiRoute(
  async (_request: Request, context: RouteContext) => {
    const { id } = await context.params;

    if (!UUID_REGEX.test(id)) {
      throw new ApiError(400, "BAD_REQUEST", "ID catatan nggak valid.");
    }

    const { supabase, userId } = await requireUser();

    const { data: deletedRow, error } = await supabase
      .from("debts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new ApiError(500, "INTERNAL_ERROR", "Gagal menghapus catatan utang.");
    }

    if (!deletedRow) {
      throw new ApiError(404, "NOT_FOUND", "Catatan nggak ditemukan.");
    }

    return NextResponse.json(
      { data: { id: deletedRow.id } },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
);
