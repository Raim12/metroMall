"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FanIllustration } from "@/components/product/fan-illustration";
import { useCartStore, selectSubtotal } from "@/store/cart-store";
import { formatPkr } from "@/lib/utils";

export function CartSheet() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const items = useCartStore((s) => s.items);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore(selectSubtotal);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="size-5 text-brand-600" aria-hidden />
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Nothing here yet."
              : `${items.length} ${items.length === 1 ? "line" : "lines"} ready for checkout.`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-brand-50">
              <ShoppingBag className="size-8 text-brand-500" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Browse the catalogue and add a fan to get started.
              </p>
            </div>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/catalogue">Shop all fans</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.key}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.22 }}
                      className="flex gap-3 rounded-xl border bg-card p-3"
                    >
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="metro-tile grid size-20 shrink-0 place-items-center rounded-lg p-1.5"
                      >
                        <FanIllustration
                          variant={item.illustration}
                          color={item.color.hex}
                          trim={item.color.trim}
                          title={item.name}
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => setOpen(false)}
                            className="truncate text-sm font-semibold hover:text-brand-700"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </div>

                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.size} · {item.color.name}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-lg border">
                            <button
                              type="button"
                              onClick={() => decrement(item.key)}
                              aria-label="Decrease quantity"
                              className="grid size-7 place-items-center rounded-l-lg transition-colors hover:bg-muted"
                            >
                              <Minus className="size-3.5" aria-hidden />
                            </button>
                            <span className="w-8 text-center text-sm font-medium tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => increment(item.key)}
                              aria-label="Increase quantity"
                              className="grid size-7 place-items-center rounded-r-lg transition-colors hover:bg-muted"
                            >
                              <Plus className="size-3.5" aria-hidden />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-brand-700 tabular-nums">
                            {formatPkr(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            <div className="border-t bg-muted/40 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-lg font-extrabold tabular-nums">
                  {formatPkr(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Delivery calculated at checkout. Cash on Delivery available
                nationwide.
              </p>
              <Separator className="my-3" />
              <Button
                size="lg"
                className="w-full bg-cta-400 font-bold text-cta-foreground hover:bg-cta-500"
                asChild
              >
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  Checkout
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="mt-1 w-full"
                onClick={() => setOpen(false)}
              >
                Continue shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
