"use client";

import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
          theme === "light"
            ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="Mode Terang (Light)"
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
          theme === "dark"
            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="Mode Gelap (Dark)"
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
          theme === "system"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="Ikuti Sistem"
        aria-label="System theme"
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
}
