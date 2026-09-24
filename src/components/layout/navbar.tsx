"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, ShoppingCart, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { NAV_LINKS } from "@/lib/constants";
import { useCartStore, selectItemCount } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore(selectItemCount);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  React.useEffect(() => {
    // rAF-throttled: scroll fires far more often than the browser paints, and
    // this only ever flips a boolean.
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 8);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={cn(
          "mx-auto w-full max-w-7xl px-4 transition-all duration-300 sm:px-6 lg:px-8",
          scrolled ? "pt-2" : "pt-4",
        )}
      >
        <nav
          className={cn(
            // `backdrop-blur-sm` rather than `-xl`: this element is sticky, so
            // the blur is recomputed over the full bar width on every scroll
            // frame, and the cost scales with the blur radius. Once scrolled the
            // background is near-opaque, so the blur is dropped entirely.
            "flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition-colors duration-300 sm:px-4",
            scrolled
              ? "border-border/80 bg-white/95 shadow-lg shadow-ink-950/5"
              : "border-white/60 bg-white/75 shadow-sm backdrop-blur-sm",
          )}
        >
          <Logo />

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-brand-50 text-brand-700"
                      : "text-foreground/75 hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                  {link.children ? (
                    <ChevronDown
                      className="size-3.5 transition-transform group-hover:rotate-180"
                      aria-hidden
                    />
                  ) : null}
                </Link>

                {link.children ? (
                  <div className="invisible absolute left-0 top-full z-50 w-64 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-xl border bg-white p-1.5 shadow-xl shadow-ink-950/10">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-lg px-3 py-2 transition-colors hover:bg-brand-50"
                        >
                          <span className="block text-sm font-semibold text-foreground">
                            {child.label}
                          </span>
                          {child.description ? (
                            <span className="block text-xs text-muted-foreground">
                              {child.description}
                            </span>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              aria-label={`Open cart${hasHydrated && itemCount > 0 ? `, ${itemCount} items` : ""}`}
              className="relative size-10 rounded-xl hover:bg-brand-50"
            >
              <ShoppingCart className="size-5 text-brand-700" aria-hidden />
              <AnimatePresence>
                {hasHydrated && itemCount > 0 ? (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 22 }}
                    className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-cta-400 px-1 text-[0.65rem] font-bold text-cta-foreground shadow"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-xl lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden lg:hidden"
            >
              <ul className="mt-2 space-y-0.5 rounded-2xl border bg-white p-2 shadow-xl">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-brand-50 text-brand-700"
                          : "hover:bg-muted",
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children ? (
                      <ul className="ml-3 border-l pl-3">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
