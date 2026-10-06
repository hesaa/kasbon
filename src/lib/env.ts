import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({
      message:
        "NEXT_PUBLIC_SUPABASE_URL belum diisi. Buat file .env atau .env.local terlebih dahulu.",
    })
    .min(1, "NEXT_PUBLIC_SUPABASE_URL tidak boleh kosong")
    .url("NEXT_PUBLIC_SUPABASE_URL harus berupa URL valid"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string({
      message:
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum diisi. Buat file .env atau .env.local terlebih dahulu.",
    })
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY wajib diisi"),
});

// Explicit static access required for Next.js build-time inline replacement
export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
