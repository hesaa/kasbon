import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <FileQuestion className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Halaman tidak ditemukan
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Halaman yang kamu cari nggak ada atau udah dipindahin.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" size="md">
              <Home className="h-4 w-4" />
              <span>Kembali ke Kasbon</span>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
