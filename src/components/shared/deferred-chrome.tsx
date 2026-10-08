"use client";

import dynamic from "next/dynamic";

/**
 * Site furniture that nothing on first paint depends on.
 *
 * The cart drawer, the toast host and the floating WhatsApp/scroll-to-top
 * buttons all live in the root layout, so their code was part of the initial
 * hydration on every page. None of them is visible until the user does
 * something: the drawer needs a click on the cart, a toast needs an action to
 * report, and the floating buttons sit outside the first viewport's content.
 *
 * Lighthouse measured the LCP image loading in 825ms and then waiting 2,781ms
 * to paint — the main thread was busy. Hydrating less is the fix for that
 * render delay, and this is the part that can be deferred without changing
 * what the page looks like.
 *
 * `ssr: false` needs a client component, which is the only reason this wrapper
 * exists rather than the calls sitting in layout.tsx.
 */

const CartSheet = dynamic(
  () => import("@/components/cart/cart-sheet").then((m) => m.CartSheet),
  { ssr: false },
);

const FloatingActions = dynamic(
  () => import("@/components/layout/floating-actions").then((m) => m.FloatingActions),
  { ssr: false },
);

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => m.Toaster),
  { ssr: false },
);

export function DeferredChrome() {
  return (
    <>
      <CartSheet />
      <FloatingActions />
      <Toaster position="top-center" richColors />
    </>
  );
}
