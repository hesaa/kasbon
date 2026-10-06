import { createClient } from "@/lib/supabase/server";
import { ApiError } from "./errors";

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const userId = data?.claims?.sub;

  if (error || !userId) {
    throw new ApiError(401, "UNAUTHORIZED", "Kamu belum login. Masuk dulu ya.");
  }

  return { supabase, userId };
}
