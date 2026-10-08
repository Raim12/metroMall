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
const LEGENDS_EMBLEM = "/brands/legends-gold-dark.webp";

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
        className={cn(
          "relative overflow-hidden rounded-3xl border shadow-xl shadow-ink-950/5 transition-colors duration-500",
          isPromo ? "border-[#3a2f1c] bg-[#0d0b09]" : "metro-wash bg-white",
        )}
      >
        {isPromo ? (
          <LegendsSlide direction={direction} variants={slide} reduce={Boolean(reduce)} />
        ) : (
        <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-4 lg:p-14">
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
          className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border bg-white/85 text-brand-700 shadow-md transition-colors hover:bg-white sm:left-4"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => paginate(1)}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border bg-white/85 text-brand-700 shadow-md transition-colors hover:bg-white sm:right-4"
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
                    ? "w-7 bg-[#c9a227]"
                    : "w-7 bg-brand-600"
                  : isPromo
                    ? "w-2 bg-white/30 hover:bg-white/50"
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
        className="relative grid items-center gap-8 p-6 pb-14 sm:p-10 sm:pb-14 lg:grid-cols-2 lg:gap-4 lg:p-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(201,162,39,0.25)_0%,transparent_55%)]"
        />

        {/* Copy */}
        <div className="relative order-2 text-white lg:order-1">
          <span className="coming-soon-blink inline-flex items-center gap-2 rounded-full bg-[#c9a227] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#14100c]">
            Coming soon
          </span>
          <h1 className="mt-4 font-heading text-5xl font-black uppercase italic leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-[#e2c25b] via-[#f6e3a1] to-[#c9a227] bg-clip-text text-transparent">
              Legends
            </span>
          </h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            Home Appliances
          </p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Our own home appliance brand is launching soon. Be the first to know when it arrives.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#b8901c] via-[#e2c25b] to-[#b8901c] font-bold text-[#14100c] shadow-lg shadow-[#c9a227]/25 hover:opacity-95"
            >
              <Link href="/legends#notify">
                <Bell className="size-4" aria-hidden />
                Get notified
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white">
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
            className="object-contain drop-shadow-[0_18px_36px_rgba(201,162,39,0.3)]"
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
