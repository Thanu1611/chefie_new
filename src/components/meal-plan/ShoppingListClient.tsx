"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconPhoto,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  copyShoppingListToClipboard,
  downloadShoppingListImage,
  downloadShoppingListPdf,
} from "@/lib/meal-plan/shopping-list-export";
import { cn } from "@/lib/utils/cn";
import type { ShoppingListItem } from "@/types/meal-plan";

export function ShoppingListClient() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shopping-list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load shopping list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const { pending, purchased } = useMemo(() => {
    const pendingItems = items.filter((i) => !i.purchased);
    const purchasedItems = items.filter((i) => i.purchased);
    return { pending: pendingItems, purchased: purchasedItems };
  }, [items]);

  const togglePurchased = async (item: ShoppingListItem) => {
    const next = !item.purchased;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, purchased: next } : i)),
    );
    try {
      const res = await fetch("/api/shopping-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, purchased: next }),
      });
      if (!res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, purchased: item.purchased } : i)),
        );
      }
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, purchased: item.purchased } : i)),
      );
    }
  };

  const deleteItem = async (id: number) => {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/shopping-list?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async () => {
    setExporting("copy");
    setError(null);
    setSuccess(null);
    try {
      await copyShoppingListToClipboard(items);
      setSuccess("List copied to clipboard.");
    } catch {
      setError("Could not copy to clipboard.");
    } finally {
      setExporting(null);
    }
  };

  const handlePdf = () => {
    setExporting("pdf");
    setError(null);
    try {
      downloadShoppingListPdf(items);
      setSuccess("PDF download started.");
    } catch {
      setError("Could not generate PDF.");
    } finally {
      setExporting(null);
    }
  };

  const handleImage = () => {
    setExporting("image");
    setError(null);
    try {
      downloadShoppingListImage(items);
      setSuccess("Image download started.");
    } catch {
      setError("Could not generate image.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15">
          <IconShoppingCart className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-3xl font-bold text-foreground">Shopping List</h1>
        <p className="mt-2 text-muted">
          Your saved ingredients from meal planning
        </p>
        <Link href="/meal-planning" className="btn-secondary mt-4 inline-flex">
          Back to meal planning
        </Link>
      </header>

      {!loading && items.length > 0 && (
        <section className="card flex flex-col gap-2 p-4 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => void handleCopy()}
            disabled={!!exporting}
            className="btn-secondary flex-1"
          >
            <IconCopy size={18} />
            {exporting === "copy" ? "Copying…" : "Copy list"}
          </button>
          <button
            type="button"
            onClick={handlePdf}
            disabled={!!exporting}
            className="btn-secondary flex-1"
          >
            <IconDownload size={18} />
            {exporting === "pdf" ? "Preparing…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={handleImage}
            disabled={!!exporting}
            className="btn-secondary flex-1"
          >
            <IconPhoto size={18} />
            {exporting === "image" ? "Preparing…" : "Download image"}
          </button>
        </section>
      )}

      {loading && <LoadingState message="Loading shopping list…" />}

      {error && <p className="alert-error px-4 py-2">{error}</p>}

      {success && (
        <p className="alert-success px-4 py-2">
          <IconCheck size={18} />
          {success}
        </p>
      )}

      {!loading && items.length === 0 && (
        <article className="card p-6 text-center">
          <p className="text-muted">
            No saved items yet. On meal planning, choose a date range, tap{" "}
            <strong className="text-foreground">Generate Shopping List</strong>, then{" "}
            <strong className="text-foreground">Add to View List</strong>.
          </p>
        </article>
      )}

      {!loading && pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">To buy</h2>
          <ul className="space-y-2">
            {pending.map((item) => (
              <ShoppingRow
                key={item.id}
                item={item}
                onToggle={togglePurchased}
                onDelete={deleteItem}
                deleting={deletingId === item.id}
              />
            ))}
          </ul>
        </section>
      )}

      {!loading && purchased.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-muted">Purchased</h2>
          <ul className="space-y-2">
            {purchased.map((item) => (
              <ShoppingRow
                key={item.id}
                item={item}
                onToggle={togglePurchased}
                onDelete={deleteItem}
                deleting={deletingId === item.id}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ShoppingRow({
  item,
  onToggle,
  onDelete,
  deleting,
}: {
  item: ShoppingListItem;
  onToggle: (item: ShoppingListItem) => void;
  onDelete: (id: number) => void;
  deleting?: boolean;
}) {
  return (
    <li className="card flex items-center gap-2 p-3 sm:gap-3 sm:p-4">
      <button
        type="button"
        onClick={() => void onToggle(item)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-pressed={item.purchased}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            item.purchased
              ? "border-brand bg-brand text-white"
              : "border-warm-200 bg-surface",
          )}
        >
          {item.purchased && <IconCheck size={18} />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-medium",
              item.purchased && "line-through text-muted",
            )}
          >
            {item.ingredientName}
          </span>
          {item.quantity && (
            <span className="text-xs text-muted">{item.quantity}</span>
          )}
        </span>
      </button>
      <button
        type="button"
        onClick={() => void onDelete(item.id)}
        disabled={deleting}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-error-light hover:text-error disabled:opacity-50"
        aria-label={`Delete ${item.ingredientName}`}
      >
        <IconTrash size={18} />
      </button>
    </li>
  );
}
