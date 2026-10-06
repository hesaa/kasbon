"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Wallet, Eye, EyeOff, Loader2 } from "lucide-react";
import { signupAction, type AuthState } from "../actions";
import { old } from "@/lib/form/state";
import { COPY } from "@/lib/copy";


export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signupAction,
    {}
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-md shadow-indigo-200">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{COPY.appName}</h1>
          <p className="text-sm text-slate-500 mt-1">{COPY.appTagline}</p>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-6">{COPY.signupTitle}</h2>

        {state.error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {state.error}
          </div>
        )}

        {state.message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={old(state, "email")}
              placeholder="nama@email.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {COPY.signupSubmit}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            {COPY.signupLinkText}
          </Link>
        </div>
      </div>
    </main>
  );
}
