"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart-store";

/**
 * Empties the cart once an order has actually been placed.
 *
 * This lives on the confirmation page rather than in the checkout form because
 * a gateway payment leaves the site: the browser is sent to Safepay and only
 * comes back here. Clearing before the redirect would throw away the basket of
 * anyone whose payment fails or who cancels, so the cart survives until an
 * order genuinely exists.
 */

const CLEARED_KEY = "metro-cleared-orders";
/** Enough to cover a browsing session; the list is only used for de-duping. */
const REMEMBER = 20;

function readCleared(): string[] {
  try {
    const raw = localStorage.getItem(CLEARED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Private mode, blocked storage, or corrupted value.
    return [];
  }
}

export function ClearCartOnOrder({
  orderNumber,
  shouldClear,
}: {
  orderNumber: string;
  /** False when the payment failed — the customer may want to retry. */
  shouldClear: boolean;
}) {
  const clear = useCartStore((s) => s.clear);
  // Persisted state rehydrates in an effect, so clearing any earlier would be
  // undone the moment the saved cart loads back in.
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (!shouldClear || !hasHydrated) return;

    // Revisiting an old confirmation link must not wipe a new basket.
    const cleared = readCleared();
    if (cleared.includes(orderNumber)) return;

    clear();

    try {
      localStorage.setItem(
        CLEARED_KEY,
        JSON.stringify([...cleared.slice(-(REMEMBER - 1)), orderNumber]),
      );
    } catch {
      // Not being able to record it only risks a redundant clear later.
    }
  }, [orderNumber, shouldClear, hasHydrated, clear]);

  return null;
}
