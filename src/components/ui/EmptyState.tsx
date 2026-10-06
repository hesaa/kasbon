import { Inbox, FilterX, AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { COPY } from "@/lib/copy";

interface EmptyStateProps {
  type?: "empty" | "filtered" | "error";
  onAction?: () => void;
  actionLabel?: string;
  errorMessage?: string;
}

export function EmptyState({
  type = "empty",
  onAction,
  actionLabel,
  errorMessage,
}: EmptyStateProps) {
  if (type === "error") {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-rose-200 shadow-xs my-4">
        <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {COPY.fetchErrorTitle}
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mb-4">
          {errorMessage || COPY.toastError}
        </p>
        {onAction && (
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel || COPY.fetchErrorRetry}
          </Button>
        )}
      </div>
    );
  }

  if (type === "filtered") {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-xs my-4">
        <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
          <FilterX className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {COPY.emptyFilterTitle}
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mb-4">
          Coba ganti kata kunci pencarian atau ubah filter status & tipe.
        </p>
        {onAction && (
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel || COPY.filterReset}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-2xl border border-slate-200 shadow-xs my-4">
      <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{COPY.emptyTitle}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{COPY.emptySubtitle}</p>
      {onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel || COPY.emptyCTA}
        </Button>
      )}
    </div>
  );
}
