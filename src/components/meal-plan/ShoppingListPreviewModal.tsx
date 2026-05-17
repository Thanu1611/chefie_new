"use client";

import {
  IconCalendar,
  IconCheck,
  IconListCheck,
  IconShoppingCart,
  IconX,
} from "@tabler/icons-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatShortDate } from "@/lib/meal-plan/dates";
import { cn } from "@/lib/utils/cn";
import type { GeneratedShoppingLine, PlanAddStatusResult } from "@/types/meal-plan";

interface ShoppingListPreviewModalProps {
  open: boolean;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  items: GeneratedShoppingLine[];
  planCount: number;
  hasGenerated: boolean;
  planStatus: PlanAddStatusResult | null;
  checkingPlanStatus?: boolean;
  loading?: boolean;
  saving?: boolean;
  error?: string | null;
  success?: string | null;
  todayKey: string;
  onClose: () => void;
  onGenerate: () => void;
  onAddToViewList: () => void;
}

function validateRange(from: string, to: string, todayKey: string): string | null {
  if (!from || !to) return "Select both From and To dates.";
  if (from < todayKey) return "From date cannot be in the past.";
  if (to < from) return "To date cannot be before From date.";
  return null;
}

export function ShoppingListPreviewModal({
  open,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  items,
  planCount,
  hasGenerated,
  planStatus,
  checkingPlanStatus,
  loading,
  saving,
  error,
  success,
  todayKey,
  onClose,
  onGenerate,
  onAddToViewList,
}: ShoppingListPreviewModalProps) {
  if (!open) return null;

  const rangeError = validateRange(fromDate, toDate, todayKey);
  const showPreview = hasGenerated && !loading;
  const addDisabled =
    saving ||
    loading ||
    checkingPlanStatus ||
    planStatus?.status === "empty" ||
    planStatus?.status === "all_added";
  const statusMessage = planStatus?.message;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shopping-preview-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <article className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl bg-background shadow-xl sm:rounded-3xl">
        <header className="flex items-start justify-between gap-3 border-b border-warm-200 p-4 sm:p-5">
          <div>
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15">
              <IconShoppingCart className="h-5 w-5 text-brand" />
            </span>
            <h2 id="shopping-preview-title" className="text-lg font-bold text-foreground">
              {showPreview ? "Shopping list preview" : "Generate shopping list"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {showPreview
                ? `${formatShortDate(fromDate)} – ${formatShortDate(toDate)} · ${planCount} planned meal${planCount === 1 ? "" : "s"}`
                : "Choose a date range for planned meals"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted hover:bg-warm-100"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <section className="card space-y-3 p-4">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <IconCalendar size={16} className="text-brand" />
              Date range
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">From date</span>
                <input
                  type="date"
                  value={fromDate}
                  min={todayKey}
                  onChange={(e) => onFromDateChange(e.target.value)}
                  disabled={loading || saving}
                  className="input"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">To date</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || todayKey}
                  onChange={(e) => onToDateChange(e.target.value)}
                  disabled={loading || saving}
                  className="input"
                />
              </label>
            </div>
            {!hasGenerated && rangeError && (
              <p className="text-sm text-red-600">{rangeError}</p>
            )}
            {!showPreview && (
              <button
                type="button"
                onClick={onGenerate}
                disabled={!!rangeError || loading || saving}
                className="btn-primary w-full"
              >
                <IconShoppingCart size={18} />
                {loading ? "Generating…" : "Generate list"}
              </button>
            )}
            {showPreview && (
              <button
                type="button"
                onClick={onGenerate}
                disabled={!!rangeError || loading || saving}
                className="btn-secondary w-full"
              >
                Regenerate list
              </button>
            )}
          </section>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          {success && (
            <p className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800">
              <IconCheck size={18} />
              {success}
            </p>
          )}

          {showPreview && statusMessage && (
            <p
              className={cn(
                "rounded-xl px-3 py-2 text-sm",
                planStatus?.status === "all_added"
                  ? "bg-brand/10 text-brand-dark"
                  : planStatus?.status === "partial"
                    ? "bg-warm-50 text-foreground"
                    : "bg-warm-50 text-muted",
              )}
            >
              {statusMessage}
            </p>
          )}

          {checkingPlanStatus && (
            <p className="text-center text-xs text-muted">Checking planned meals…</p>
          )}

          {loading && <LoadingState message="Building your list…" />}

          {showPreview && planStatus?.status === "empty" && items.length === 0 && (
            <p className="rounded-xl bg-warm-50 px-4 py-6 text-center text-sm text-muted">
              No planned meals found for this date range.
            </p>
          )}

          {showPreview &&
            planStatus?.status !== "empty" &&
            items.length === 0 && (
              <p className="rounded-xl bg-warm-50 px-4 py-6 text-center text-sm text-muted">
                No ingredients found for meals planned in this date range.
              </p>
            )}

          {showPreview && items.length > 0 && (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li
                  key={`${index}-${item.ingredientName}-${item.quantity}`}
                  className="card flex items-center justify-between gap-3 p-3"
                >
                  <span className="font-medium text-foreground">
                    {item.ingredientName}
                  </span>
                  <span className="shrink-0 text-xs text-muted">{item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showPreview && (
          <footer className="flex flex-col gap-2 border-t border-warm-200 p-4 sm:flex-row sm:p-5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:flex-1"
              disabled={saving}
            >
              Close
            </button>
            <button
              type="button"
              onClick={onAddToViewList}
              disabled={addDisabled}
              className={cn(
                "w-full sm:flex-1",
                addDisabled ? "btn-secondary cursor-default opacity-80" : "btn-primary",
                saving && "opacity-70",
              )}
            >
              <IconListCheck size={18} />
              {planStatus?.status === "all_added"
                ? "All meals already added"
                : saving
                  ? "Saving…"
                  : "Add to View List"}
            </button>
          </footer>
        )}

        {!showPreview && (
          <footer className="border-t border-warm-200 p-4 sm:p-5">
            <button type="button" onClick={onClose} className="btn-secondary w-full">
              Cancel
            </button>
          </footer>
        )}
      </article>
    </div>
  );
}
