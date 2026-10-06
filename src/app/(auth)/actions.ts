"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { COPY } from "@/lib/copy";

const authSchema = z.object({
  email: z.string().trim().email("Format email nggak valid"),
  password: z.string().min(8, "Password minimal 8 karakter ya"),
});

export interface AuthState {
  error?: string;
  message?: string;
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const validated = authSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message;
    return { error: firstError || "Email atau password belum valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    const code = error.code as keyof typeof COPY.authErrors;
    const message = COPY.authErrors[code] || COPY.authErrors.fallback;
    return { error: message };
  }

  redirect("/");
}

export async function signupAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const validated = authSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message;
    return { error: firstError || "Email atau password belum valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    const code = error.code as keyof typeof COPY.authErrors;
    const message = COPY.authErrors[code] || `${COPY.authErrors.fallback}: ${error.message}`;
    return { error: message };
  }

  if (data.user && !data.session) {
    return { message: COPY.signupConfirmNotice };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
