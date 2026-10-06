"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { RadioCards } from "@/components/ui/RadioCards";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { debtSchema } from "@/lib/validation/debt";
import { formatRupiahInput, parseRupiahInput } from "@/lib/format/rupiah";
import { todayInJakarta } from "@/lib/format/relative-date";
import type { Debt, DebtType } from "@/types/debt";
import type { CreateDebtInput } from "@/lib/validation/debt";
import { COPY } from "@/lib/copy";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDebtInput) => Promise<void>;
  editingDebt?: Debt | null;
  isLoading?: boolean;
}

export function DebtFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingDebt,
  isLoading = false,
}: DebtFormModalProps) {
  const [type, setType] = useState<DebtType>("owed_to_me");
  const [counterpartName, setCounterpartName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [debtDate, setDebtDate] = useState(todayInJakarta());
  const [showDueDate, setShowDueDate] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevEditingId, setPrevEditingId] = useState<string | null>(null);

  const currentEditingId = editingDebt ? editingDebt.id : null;

  if (isOpen !== prevIsOpen || currentEditingId !== prevEditingId) {
    setPrevIsOpen(isOpen);
    setPrevEditingId(currentEditingId);

    if (isOpen) {
      setErrors({});
      if (editingDebt) {
        setType(editingDebt.type);
        setCounterpartName(editingDebt.counterpart_name);
        setAmountInput(formatRupiahInput(String(editingDebt.amount)));
        setDebtDate(editingDebt.debt_date);
        if (editingDebt.due_date) {
          setShowDueDate(true);
          setDueDate(editingDebt.due_date);
        } else {
          setShowDueDate(false);
          setDueDate("");
        }
        setNote(editingDebt.note || "");
      } else {
        setType("owed_to_me");
        setCounterpartName("");
        setAmountInput("");
        setDebtDate(todayInJakarta());
        setShowDueDate(false);
        setDueDate("");
        setNote("");
      }
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatRupiahInput(rawVal);
    setAmountInput(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsedAmount = parseRupiahInput(amountInput);

    const payload = {
      type,
      counterpart_name: counterpartName,
      amount: parsedAmount ?? 0,
      debt_date: debtDate,
      due_date: showDueDate && dueDate ? dueDate : null,
      note: note.trim() || null,
    };

    const validationResult = debtSchema.safeParse(payload);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = issue.path[0]?.toString() || "form";
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await onSubmit(validationResult.data);
      onClose();
    } catch {
      // Handled by mutation toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDebt ? COPY.formEditTitle : COPY.formCreateTitle}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <RadioCards
          label={COPY.formType}
          value={type}
          onChange={(val) => setType(val)}
        />

        <Input
          label={COPY.formName}
          placeholder={COPY.formNamePlaceholder}
          value={counterpartName}
          onChange={(e) => setCounterpartName(e.target.value)}
          error={errors.counterpart_name}
          autoFocus
          autoComplete="off"
        />

        <Input
          label={COPY.formAmount}
          prefixText="Rp"
          inputMode="numeric"
          placeholder="0"
          value={amountInput}
          onChange={handleAmountChange}
          error={errors.amount}
        />

        <Input
          label={COPY.formDate}
          type="date"
          value={debtDate}
          onChange={(e) => setDebtDate(e.target.value)}
          error={errors.debt_date}
        />

        {!showDueDate ? (
          <button
            type="button"
            onClick={() => setShowDueDate(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
          >
            {COPY.formDueDateToggle}
          </button>
        ) : (
          <Input
            label={COPY.formDueDate}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={errors.due_date}
          />
        )}

        <Textarea
          label={COPY.formNote}
          placeholder={COPY.formNotePlaceholder}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          error={errors.note}
          maxLength={200}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {COPY.actionCancel}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {COPY.actionSave}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
