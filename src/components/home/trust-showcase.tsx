"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

import { Section, SectionHeading } from "@/components/shared/section-heading";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Proof the shop is real: photographs of the outlet on M.A. Jinnah Road and
 * the trade memberships behind the "authorized dealer" claim.
 *
 * The outlet photos run as a carousel because they are worth looking through
 * one at a time. The certificates slide too, but as a swipeable rail that
 * shows two at a time on wider screens and pauses under the pointer, so a
 * certificate can always be stopped and read. Add a brand's dealership
 * certificate to CERTIFICATES and the rail picks it up.
 */

const OUTLET_PHOTOS = [
  { src: "/trust/outlet-1.webp", alt: "Inside the Metro Electric Co. showroom on M.A. Jinnah Road" },
  { src: "/trust/outlet-2.webp", alt: "The Metro Electric Co. shopfront" },
  { src: "/trust/outlet-3.webp", alt: "Fans and appliances on display in the showroom" },
  { src: "/trust/outlet-4.webp", alt: "The showroom floor, stocked with fans and home appliances" },
];

const CERTIFICATES = [
  {
    src: "/trust/cert-kcci.webp",
    title: "Karachi Chamber of Commerce & Industry",
    detail: "Membership No. 42788 · valid to 31 March 2027",
    alt: "KCCI membership certificate issued to Metro Electric Co.",
  },
  {
    src: "/trust/cert-keda.webp",
    title: "Karachi Electronics Dealers Association",
    detail: "Lifetime member",
    alt: "KEDA lifetime membership certificate issued to Metro Electric Company",
  },
];

const AUTOPLAY_MS = 5000;

export function TrustShowcase() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = OUTLET_PHOTOS.length;

  const go = React.useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  React.useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, go]);

  // Same raw-touch approach as the hero carousel: LazyMotion runs the
  // domAnimation feature set, which has no drag engine.
  const touch = React.useRef<{ x: number; y: number } | null>(null);

  return (
    <Section className="bg-muted/40">
      <SectionHeading
        eyebrow="See for yourself"
        title="Our shop, our"
        highlight="credentials"
        description={`Visit us on ${SITE.address.line2.replace(", Pakistan", "")}, or see the memberships behind the counter.`}
      />

      {/* ----------------------------- Outlet ----------------------------- */}
      <div
        className="relative mt-10 touch-pan-y overflow-hidden rounded-3xl border bg-white shadow-xl shadow-ink-950/5"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          touch.current = null;
          setPaused(false);
          if (!start) return;
          const dx = e.changedTouches[0].clientX - start.x;
          const dy = e.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
          go(dx < 0 ? 1 : -1);
        }}
        aria-roledescription="carousel"
        aria-label="Photographs of our showroom"
      >
        <div className="relative aspect-[3/2] w-full">
          {OUTLET_PHOTOS.map((photo, i) => (
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              // All four stay mounted and cross-fade, so there is no reflow and
              // no flash of empty space between slides.
              className={cn(
                "object-cover transition-opacity duration-700 motion-reduce:transition-none",
                i === index ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={i !== index}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-md transition-colors hover:bg-white"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-md transition-colors hover:bg-white"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>

        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {OUTLET_PHOTOS.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Photo ${i + 1} of ${count}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full bg-white shadow transition-all duration-300",
                i === index ? "w-7" : "w-2 opacity-60 hover:opacity-90",
              )}
            />
          ))}
        </div>
      </div>

      {/* -------------------------- Certificates -------------------------- */}
      <CertificateRail />
    </Section>
  );
}

function CertificateRail() {
  const rail = React.useRef<HTMLDivElement>(null);
  const [paused, setPaused] = React.useState(false);

  const step = React.useCallback((delta: number) => {
    const el = rail.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const width = card ? card.offsetWidth + 20 : el.clientWidth;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (delta > 0 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: delta * width, behavior: "smooth" });
  }, []);

  // Auto-advance only when there is somewhere to go: with every certificate
  // already on screen, sliding would just jiggle the row.
  React.useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const el = rail.current;
      if (el && el.scrollWidth > el.clientWidth + 4) step(1);
    }, AUTOPLAY_MS + 1000);
    return () => window.clearInterval(id);
  }, [paused, step]);

  return (
    <div
      className="relative mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={rail}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
        aria-label="Our certificates and memberships"
      >
        {CERTIFICATES.map((cert) => (
          <figure
            key={cert.src}
            className="w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white shadow-sm sm:w-[calc(50%-0.625rem)]"
          >
            <div className="relative aspect-[4/3] bg-muted/30">
              <Image
                src={cert.src}
                alt={cert.alt}
                fill
                sizes="(min-width: 640px) 45vw, 100vw"
                // `contain`: a certificate cropped to fill its frame is a
                // certificate you cannot read.
                className="object-contain p-3"
              />
            </div>
            <figcaption className="flex items-start gap-2.5 border-t p-4">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
              <span>
                <span className="block text-sm font-bold">{cert.title}</span>
                <span className="block text-xs text-muted-foreground">{cert.detail}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Two certificates fit side by side from sm up, so arrows are only
          needed on phones until a third is added. */}
      {CERTIFICATES.length > 1 ? (
        <div className={cn("mt-4 flex justify-center gap-2", CERTIFICATES.length <= 2 && "sm:hidden")}>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous certificate"
            className="grid size-10 place-items-center rounded-full border bg-white text-ink-900 shadow-sm transition-colors hover:bg-muted"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next certificate"
            className="grid size-10 place-items-center rounded-full border bg-white text-ink-900 shadow-sm transition-colors hover:bg-muted"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
