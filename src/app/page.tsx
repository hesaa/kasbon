import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/debts/DashboardClient";
import { SummaryCardsSkeleton, DebtListSkeleton } from "@/components/ui/Skeleton";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const userEmail = data?.claims?.email as string | undefined;

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 p-6 space-y-6 max-w-3xl mx-auto">
          <SummaryCardsSkeleton />
          <DebtListSkeleton />
        </div>
      }
    >
      <DashboardClient userEmail={userEmail} />
    </Suspense>
  );
}
