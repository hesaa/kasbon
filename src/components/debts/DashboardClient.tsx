"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { SummaryCards } from "@/components/debts/SummaryCards";
import { DebtFilters } from "@/components/debts/DebtFilters";
import { DebtList } from "@/components/debts/DebtList";
import { CounterpartGroupList } from "@/components/debts/CounterpartGroupList";
import { DebtBarChart } from "@/components/debts/DebtBarChart";
import { DebtFormModal } from "@/components/debts/DebtFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDebts } from "@/hooks/useDebts";
import { useCreateDebt } from "@/hooks/useCreateDebt";
import { useUpdateDebt } from "@/hooks/useUpdateDebt";
import { useToggleSettled } from "@/hooks/useToggleSettled";
import { useDeleteDebt } from "@/hooks/useDeleteDebt";
import { useDebtFilters } from "@/hooks/useDebtFilters";
import { formatRupiah } from "@/lib/format/rupiah";
import type { Debt } from "@/types/debt";
import type { CreateDebtInput } from "@/lib/validation/debt";
import { Plus, List, Users, BarChart3 } from "lucide-react";
import { COPY } from "@/lib/copy";

interface DashboardClientProps {
  userEmail?: string;
}

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const { filters, setFilters, resetFilters, isFiltered } = useDebtFilters();
  const { data, isLoading, isError, error, refetch } = useDebts(filters, userEmail);


  const createMutation = useCreateDebt();
  const updateMutation = useUpdateDebt();
  const toggleSettledMutation = useToggleSettled();
  const deleteMutation = useDeleteDebt();

  const [viewMode, setViewMode] = useState<"list" | "group" | "chart">("list");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);

  const handleOpenCreate = () => {
    setEditingDebt(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: CreateDebtInput) => {
    if (editingDebt) {
      await updateMutation.mutateAsync({
        id: editingDebt.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleToggleSettled = (id: string, currentSettled: boolean) => {
    toggleSettledMutation.mutate({
      id,
      settled: !currentSettled,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDebt) return;
    await deleteMutation.mutateAsync(deletingDebt.id);
    setDeletingDebt(null);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header userEmail={userEmail} />

      <main className="mx-auto max-w-3xl w-full px-4 pb-28 pt-6 space-y-6 grow">
        <SummaryCards summary={data?.summary} isLoading={isLoading} />

        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Daftar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("group")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "group"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Per Orang</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "chart"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Grafik</span>
            </button>
          </div>
        </div>

        {viewMode === "list" && (
          <>
            <DebtFilters
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetFilters}
              isFiltered={isFiltered}
              onNewDebtClick={handleOpenCreate}
            />
            <DebtList
              debts={data?.data}
              isLoading={isLoading}
              isError={isError}
              errorMessage={error?.message}
              isFiltered={isFiltered}
              onRetry={() => refetch()}
              onResetFilters={resetFilters}
              onNewDebtClick={handleOpenCreate}
              onToggleSettled={handleToggleSettled}
              onEdit={handleOpenEdit}
              onDelete={(debt) => setDeletingDebt(debt)}
            />
          </>
        )}

        {viewMode === "group" && (
          <CounterpartGroupList debts={data?.data} />
        )}

        {viewMode === "chart" && (
          <DebtBarChart summary={data?.summary} />
        )}
      </main>

      <button
        type="button"
        onClick={handleOpenCreate}
        aria-label={COPY.actionNewDebt}
        className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 z-20 cursor-pointer"
      >
        <Plus className="h-6 w-6" />
      </button>

      <DebtFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingDebt={editingDebt}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingDebt)}
        onClose={() => setDeletingDebt(null)}
        onConfirm={handleDeleteConfirm}
        title={COPY.deleteTitle}
        description={
          deletingDebt
            ? COPY.deleteConfirmText
              .replace("{nama}", deletingDebt.counterpart_name)
              .replace("{amount}", formatRupiah(deletingDebt.amount))
            : ""
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
