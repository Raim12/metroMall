"use client";

import { LazyMotion } from "framer-motion";

/**
 * Loads Framer Motion's animation engine off the critical path.
 *
 * Importing `motion` pulls the whole DOM feature set into the first-load
 * bundle. Because <CartSheet> lives in the root layout, that happened on every
 * page — Lighthouse attributed ~439ms of main-thread script evaluation to the
 * chunk it landed in, and Total Blocking Time was what held the performance
 * score down.
 *
 * `m` is the same component with no features bundled in; `LazyMotion` fetches
 * them separately, after the page is interactive. Nothing on the site uses
 * layout or drag animations, so `domAnimation` (animations, variants, exit
 * transitions, hover/tap gestures) is the complete set — `domMax` would pull
 * the projection engine back in.
 *
 * `strict` makes a stray `motion.div` throw instead of silently reintroducing
 * the full bundle, which is the mistake this exists to prevent.
 */
const loadFeatures = () =>
  import("framer-motion").then((mod) => mod.domAnimation);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
