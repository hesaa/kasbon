"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Ada masalah saat memuat halaman
        </h2>
        <p className="text-sm text-slate-500">
          Terjadi kesalahan tak terduga. Coba muat ulang halaman ini ya.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => reset()}>
            <RefreshCw className="h-4 w-4" />
            <span>Coba lagi</span>
          </Button>
          <Link href="/">
            <Button variant="secondary" size="sm">
              <Home className="h-4 w-4" />
              <span>Ke Beranda</span>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
