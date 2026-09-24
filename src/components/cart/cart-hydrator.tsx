"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart-store";

/**
 * Restores the persisted cart after React has hydrated.
 *
 * The store sets `skipHydration: true` so that server HTML and the first
 * client render always agree (empty cart); this effect then rehydrates and
 * flips `hasHydrated`, which is what the navbar badge and checkout gate on.
 */
export function CartHydrator() {
  React.useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}
