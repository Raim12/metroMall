"use client";

import * as React from "react";
import { Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { adjustStock, updateStock } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

/**
 * Inline stock editor.
 *
 * Optimistic: the number moves immediately and rolls back if the server
 * rejects it, so adjusting a shelf count doesn't feel like waiting on a form.
 */
export function StockControl({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [value, setValue] = React.useState(stock);
  const [draft, setDraft] = React.useState(String(stock));
  const [pending, startTransition] = React.useTransition();
  const [saved, setSaved] = React.useState(false);

  // Re-sync when the server sends a new value (e.g. after revalidation).
  React.useEffect(() => {
    setValue(stock);
    setDraft(String(stock));
  }, [stock]);

  function flashSaved() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  }

  function step(delta: number) {
    const previous = value;
    const next = Math.max(0, value + delta);
    setValue(next);
    setDraft(String(next));

    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("delta", String(delta));

      const result = await adjustStock(formData);
      if (result.ok) {
        flashSaved();
      } else {
        setValue(previous);
        setDraft(String(previous));
        toast.error(result.error);
      }
    });
  }

  function commit() {
    const parsed = Number(draft);
    if (!Number.isInteger(parsed) || parsed < 0) {
      setDraft(String(value));
      toast.error("Enter a whole number of units.");
      return;
    }
    if (parsed === value) return;

    const previous = value;
    setValue(parsed);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("stock", String(parsed));

      const result = await updateStock(formData);
      if (result.ok) {
        flashSaved();
      } else {
        setValue(previous);
        setDraft(String(previous));
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "flex items-center rounded-lg border bg-white transition-colors",
          pending && "opacity-60",
        )}
      >
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={pending || value <= 0}
          aria-label="Decrease stock by one"
          className="grid size-7 place-items-center rounded-l-lg transition-colors hover:bg-muted disabled:opacity-40"
        >
          <Minus className="size-3.5" aria-hidden />
        </button>

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setDraft(String(value));
          }}
          inputMode="numeric"
          aria-label="Units in stock"
          className="w-12 border-x bg-transparent py-1 text-center text-sm font-semibold tabular-nums outline-none focus:bg-brand-50"
        />

        <button
          type="button"
          onClick={() => step(1)}
          disabled={pending}
          aria-label="Increase stock by one"
          className="grid size-7 place-items-center rounded-r-lg transition-colors hover:bg-muted disabled:opacity-40"
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      </div>

      <span
        aria-live="polite"
        className={cn(
          "text-brand-600 transition-opacity",
          saved ? "opacity-100" : "opacity-0",
        )}
      >
        <Check className="size-4" aria-hidden />
        <span className="sr-only">{saved ? "Stock saved" : ""}</span>
      </span>
    </div>
  );
}
