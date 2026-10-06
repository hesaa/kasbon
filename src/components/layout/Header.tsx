"use client";

import { Wallet, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { logoutAction } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { COPY } from "@/lib/copy";

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    queryClient.clear();
    await logoutAction();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="mx-auto max-w-3xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
            {COPY.appName}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {userEmail && (
            <span className="hidden sm:inline-block text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
              {userEmail}
            </span>
          )}
          <form action={handleLogout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors active:scale-95 cursor-pointer"
              aria-label={COPY.logout}
            >
              <LogOut className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>{COPY.logout}</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
