"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrance animations.
 *
 * Deliberately *not* built on Framer Motion. The homepage alone mounts ~40 of
 * these, and each Framer `motion` component carries its own observer and
 * animation loop. This version shares a single IntersectionObserver across
 * every instance on the page and animates with plain CSS transitions, which the
 * compositor handles off the main thread.
 *
 * Framer Motion is still used where it earns its weight — the hero carousel,
 * cart drawer, product gallery and the navbar badge.
 */

type Direction = "up" | "down" | "left" | "right" | "none";

const HIDDEN: Record<Direction, string> = {
  up: "translate3d(0, 28px, 0)",
  down: "translate3d(0, -28px, 0)",
  left: "translate3d(32px, 0, 0)",
  right: "translate3d(-32px, 0, 0)",
  none: "none",
};

/** One observer for the whole page rather than one per element. */
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.dataset.shown = "true";
        observer?.unobserve(el);
      }
    },
    { rootMargin: "0px 0px -80px 0px", threshold: 0.01 },
  );
  return observer;
}

function useReveal(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = getObserver();
    // No observer support (or SSR fallback): show immediately.
    if (!io) {
      el.dataset.shown = "true";
      return;
    }

    io.observe(el);
    return () => io.unobserve(el);
  }, [ref]);
}

export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  /** Accepted for API compatibility; reveals never re-hide. */
  once?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <div
      ref={ref}
      data-reveal=""
      className={cn(className)}
      style={
        {
          "--reveal-from": HIDDEN[direction],
          transitionDelay: `${delay}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

const StaggerContext = React.createContext(0.08);

export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <StaggerContext.Provider value={stagger}>
      <div ref={ref} data-reveal-group="" className={cn(className)}>
        {children}
      </div>
    </StaggerContext.Provider>
  );
}

/**
 * Children stagger off the parent group's single observer — each item just
 * delays its own transition, so no extra observers are created.
 */
export function RevealItem({
  children,
  className,
  index,
}: {
  children: React.ReactNode;
  className?: string;
  /** Optional explicit position; otherwise derived from DOM order. */
  index?: number;
}) {
  const stagger = React.useContext(StaggerContext);
  const ref = React.useRef<HTMLDivElement>(null);
  const [order, setOrder] = React.useState(index ?? 0);

  React.useEffect(() => {
    if (index !== undefined || !ref.current) return;
    const parent = ref.current.parentElement;
    if (!parent) return;
    setOrder(Array.prototype.indexOf.call(parent.children, ref.current));
  }, [index]);

  return (
    <div
      ref={ref}
      data-reveal-item=""
      className={cn(className)}
      style={{ transitionDelay: `${order * stagger}s` }}
    >
      {children}
    </div>
  );
}
