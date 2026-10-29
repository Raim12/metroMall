import Image from "next/image";

import { Section, SectionHeading } from "@/components/shared/section-heading";
import { SHOWCASE_ITEMS, type ShowcaseItem } from "@/lib/showcase";

/**
 * A wall of product photography that drifts past on its own - two rails, one
 * running each way, so the section reads as movement rather than as a list.
 *
 * Purely a showcase: no prices, no links, nothing to click. It exists to show
 * the range at a glance; the catalogue is where products are actually bought.
 *
 * Stays a server component. The motion is a CSS marquee on a duplicated track
 * (the same technique as the featured rail), so this ships no JavaScript and
 * the animation runs on the compositor rather than the main thread - which is
 * what keeps it off the Total Blocking Time budget.
 */
export function ProductShowcase() {
  if (SHOWCASE_ITEMS.length === 0) return null;

  // Split into two rails so each loop is half as long, and a visitor sees
  // twice as much of the range before anything repeats.
  const half = Math.ceil(SHOWCASE_ITEMS.length / 2);
  const rails = [SHOWCASE_ITEMS.slice(0, half), SHOWCASE_ITEMS.slice(half)];

  return (
    <Section className="bg-white">
      <SectionHeading
        eyebrow="The range"
        title="Fans & appliances we"
        highlight="stock"
        description="A look across the brands we deal in - from ceiling fans to geysers, coolers and washing machines."
      />

      {/* Full-bleed, so photos enter and leave the viewport rather than
          stacking up against the container edge. */}
      <div className="relative mt-10 -mx-4 space-y-4 overflow-hidden sm:-mx-6 lg:-mx-8">
        {/* Fades the cut-off cards at both edges instead of slicing them. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-24"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-24"
        />

        {rails.map((items, rail) => (
          <Rail key={rail} items={items} reverse={rail === 1} />
        ))}
      </div>
    </Section>
  );
}

function Rail({ items, reverse }: { items: ShowcaseItem[]; reverse: boolean }) {
  // Roughly six seconds per photo, so a rail reads at a browsing pace rather
  // than racing or crawling.
  const durationSeconds = Math.max(40, items.length * 6);

  return (
    <div
      className={`product-rail gap-4 ${reverse ? "product-rail--reverse" : ""}`}
      style={{ "--rail-duration": `${durationSeconds}s` } as React.CSSProperties}
    >
      {/* The list twice over, so the loop has no seam. The second copy is
          hidden from assistive tech to avoid announcing everything twice. */}
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 gap-4" aria-hidden={copy === 1}>
          {items.map((item) => (
            <figure
              key={`${copy}-${item.image}`}
              className="w-[9.5rem] shrink-0 overflow-hidden rounded-2xl border bg-white sm:w-[12rem]"
            >
              <div className="relative aspect-square bg-white">
                <Image
                  src={item.image}
                  alt={`${item.brand} ${item.model}`}
                  fill
                  sizes="(min-width: 640px) 12rem, 9.5rem"
                  className="object-contain p-2"
                  loading="lazy"
                />
              </div>
              <figcaption className="border-t px-2.5 py-2 text-center">
                <span className="block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-brand-600">
                  {item.brand}
                </span>
                <span className="mt-0.5 block truncate text-xs font-semibold text-ink-800">
                  {item.model}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}
