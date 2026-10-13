"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  m,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowRight, Bell, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import { brandName } from "@/lib/constants";
import { formatPkr, cn } from "@/lib/utils";
import type { Product } from "@/types";

const AUTOPLAY_MS = 6500;

/** Slide 0 is the LEGENDS launch teaser; product slides follow it. */
const PROMO_SLIDES = 1;
/*
 * The plain gold emblem, not the "-dark" artwork: that one is lit for a black
 * backdrop and its edges look harsh on the cream panel used here. Same finish
 * and shadow as the LEGENDS card in <HouseBrands />.
 */
const LEGENDS_EMBLEM = "/brands/legends-gold.webp";

export function HeroSlider({ products }: { products: Product[] }) {
  const reduce = useReducedMotion();
  const [[index, direction], setState] = React.useState<[number, number]>([0, 1]);
  const [paused, setPaused] = React.useState(false);

  const count = products.length + PROMO_SLIDES;
  const isPromo = index < PROMO_SLIDES;
  const product = products[Math.max(0, index - PROMO_SLIDES)];
  const color = product.colors[0];

  const paginate = React.useCallback(
    (delta: number) =>
      setState(([current]) => [(current + delta + count) % count, delta]),
    [count],
  );

  const goTo = (next: number) =>
    setState(([current]) => [next, next > current ? 1 : -1]);

  /*
   * Swipe, done with raw touch events rather than Framer's `drag`.
   *
   * The whole site runs under LazyMotion with the `domAnimation` feature set,
   * which deliberately excludes the drag/projection engine - pulling in
   * `domMax` to get it back would undo the bundle work that took mobile Total
   * Blocking Time down. Three listeners cost nothing by comparison.
   */
  const touch = React.useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
    // Hold autoplay while a finger is down, so a slide cannot change mid-swipe.
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    setPaused(false);
    if (!start) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    // Ignore anything that is mostly vertical: that is the page scrolling, not
    // a swipe. 48px is far enough not to fire on a tap's jitter.
    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;

    // Drag left (negative dx) means "show me the next one".
    paginate(dx < 0 ? 1 : -1);
  };

  React.useEffect(() => {
    if (paused || reduce || count < 2) return;
    const id = window.setInterval(() => paginate(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reduce, count, paginate]);

  const slide: Variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * -60 }),
  };

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          touch.current = null;
          setPaused(false);
        }}
        className={cn(
          "relative overflow-hidden rounded-3xl border shadow-xl shadow-ink-950/5 transition-colors duration-500",
          // Allow vertical scrolling to pass through while we claim horizontal
          // gestures, so the page still scrolls normally over the carousel.
          "touch-pan-y",
          isPromo
            ? "border-[#e8dcb8] bg-[radial-gradient(ellipse_at_center,#fffdf6_0%,#f6efdc_60%,#ecdfba_100%)]"
            : "metro-wash bg-white",
        )}
      >
        {isPromo ? (
          <LegendsSlide direction={direction} variants={slide} reduce={Boolean(reduce)} />
        ) : (
        <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-4 lg:p-14 [&>*]:min-w-0">
          {/* Copy */}
          <AnimatePresence mode="wait" custom={direction}>
            <m.div
              key={`copy-${product.id}`}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="order-2 lg:order-1"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                {brandName(product.brand)}
              </span>

              <h1 className="mt-4 line-clamp-3 font-heading text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                {product.name}
              </h1>

              <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-brand-600">
                {product.tagline}
              </p>

              <p className="mt-5 line-clamp-3 max-w-lg text-sm leading-relaxed text-foreground/75 sm:text-base">
                {product.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-cta-400 font-bold text-cta-foreground shadow-lg shadow-cta-600/25 hover:bg-cta-500"
                >
                  <Link href={`/product/${product.slug}`}>
                    Shop Now
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/70">
                  <Link href="/catalogue">View all products</Link>
                </Button>
                <span className="ml-1 font-heading text-xl font-extrabold text-brand-700">
                  {formatPkr(product.price)}
                </span>
              </div>
            </m.div>
          </AnimatePresence>

          {/* Artwork */}
          <div className="order-1 lg:order-2">
            <AnimatePresence mode="wait" custom={direction}>
              <m.div
                key={`art-${product.id}`}
                custom={direction}
                initial={{ opacity: 0, scale: 0.88, rotate: reduce ? 0 : -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.92, rotate: reduce ? 0 : 8 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                // No `drop-shadow-*` here: a CSS filter on an element whose
                // child rotates forces a blur re-rasterization every frame.
                className="mx-auto aspect-square w-full max-w-[26rem] lg:max-w-[30rem]"
              >
                <ProductImage
                  src={product.images?.[0]}
                  alt={product.name}
                  illustration={product.illustration}
                  color={color.hex}
                  trim={color.trim}
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  priority={index === PROMO_SLIDES}
                  spin
                />
              </m.div>
            </AnimatePresence>
          </div>
        </div>
        )}

        {/* Arrows */}
        <button
          type="button"
          onClick={() => paginate(-1)}
          aria-label="Previous slide"
          // Hidden on phones, where they sat on top of the slide title; the slider
          // autoplays and the dots still navigate.
          className="absolute left-2 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border bg-white/85 text-brand-700 shadow-md transition-colors hover:bg-white sm:left-4 sm:grid"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => paginate(1)}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border bg-white/85 text-brand-700 shadow-md transition-colors hover:bg-white sm:right-4 sm:grid"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {[{ id: "legends", name: "LEGENDS — coming soon" }, ...products].map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to ${p.name}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === index
                  ? isPromo
                    ? "w-7 bg-[#b8901c]"
                    : "w-7 bg-brand-600"
                  : isPromo
                    ? "w-2 bg-[#b8901c]/30 hover:bg-[#b8901c]/50"
                    : "w-2 bg-brand-600/30 hover:bg-brand-600/50",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** The LEGENDS launch teaser, shown as the first slide. */
function LegendsSlide({
  direction,
  variants,
  reduce,
}: {
  direction: number;
  variants: Variants;
  reduce: boolean;
}) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <m.div
        key="legends"
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative grid items-center gap-8 p-6 pb-14 sm:p-10 sm:pb-14 lg:grid-cols-2 lg:gap-4 lg:p-14 [&>*]:min-w-0"
      >
        {/* Copy */}
        <div className="relative order-2 lg:order-1">
          <span className="coming-soon-blink inline-flex items-center gap-2 rounded-full bg-[#c9a227] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#14100c]">
            Coming soon
          </span>
          <h1 className="mt-4 font-heading text-5xl font-black uppercase italic leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-[#8a6d12] via-[#c9a227] to-[#8a6d12] bg-clip-text text-transparent">
              Legends
            </span>
          </h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#8a6d12]">
            Home Appliances
          </p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            A quality new home appliance brand is coming soon. Be the first to know when it arrives.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-ink-900 font-bold text-white shadow-lg shadow-ink-950/15 hover:bg-ink-700"
            >
              <Link href="/legends#notify">
                <Bell className="size-4" aria-hidden />
                Get notified
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-[#d8c58c] bg-white/60 text-ink-900 hover:bg-white hover:text-ink-900">
              <Link href="/legends">
                Discover LEGENDS
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        {/* Emblem */}
        <div className="relative order-1 mx-auto aspect-[10/7] w-full max-w-[26rem] lg:order-2 lg:max-w-[32rem]">
          <Image
            src={LEGENDS_EMBLEM}
            alt="LEGENDS emblem"
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-contain drop-shadow-[0_12px_18px_rgba(90,64,10,0.18)]"
          />
          {reduce ? null : (
            <span
              aria-hidden
              className="legends-shimmer"
              style={{ "--shimmer-mask": `url(${LEGENDS_EMBLEM})` } as React.CSSProperties}
            />
          )}
        </div>
      </m.div>
    </AnimatePresence>
  );
}
