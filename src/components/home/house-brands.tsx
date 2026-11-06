import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HOUSE_BRANDS, SITE } from "@/lib/constants";
import { LEGENDS_PREVIEW } from "@/lib/legends-preview";
import { formatPkr } from "@/lib/utils";
import { BrandText } from "@/components/shared/brand-text";
import { LazyVideo } from "@/components/shared/lazy-video";

/** Gold first: it is the one shown when motion is reduced (see globals.css). */
const LEGENDS_FINISHES = [
  { src: "/brands/legends-gold.webp", label: "gold" },
  { src: "/brands/legends-silver.webp", label: "silver" },
  { src: "/brands/legends-black.webp", label: "black" },
];

function ComingSoonBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`coming-soon-blink inline-flex items-center gap-1.5 rounded-full bg-[#c9a227] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-ink-900 ${className}`}
    >
      Coming soon
    </span>
  );
}

/**
 * New brands arriving soon, led by LEGENDS, whose emblem cycles through the
 * gold, silver and black finishes, with KARETEK and M.TEK alongside it.
 *
 * Deliberately does NOT describe these as Metro's own brands - per the client,
 * they are presented as quality new brands coming to the range.
 */
export function HouseBrands() {
  const lead = HOUSE_BRANDS.find((b) => b.lead)!;
  const others = HOUSE_BRANDS.filter((b) => !b.lead);
  // The first previewed model that has footage, shown inside the LEGENDS card.
  const firstLook = LEGENDS_PREVIEW.find((p) => p.video && p.image);

  return (
    <section id="our-brands" className="scroll-mt-28 bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            New brands
          </p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl">
            Launching <span className="italic text-[#b8901c]">soon</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Alongside Pakistan&apos;s leading brands, quality new home appliance
            brands are arriving at <BrandText>{SITE.name}</BrandText>
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {/* LEGENDS — the lead brand */}
          <article className="relative overflow-hidden rounded-3xl border border-[#e8dcb8] bg-[radial-gradient(ellipse_at_center,#fffdf6_0%,#f6efdc_60%,#ecdfba_100%)] p-6 sm:p-10 lg:col-span-2">
            <div className="flex items-center justify-end gap-3">
              <ComingSoonBadge />
            </div>

            <div className="relative mx-auto mt-6 aspect-[3/2] w-full max-w-xl">
              {LEGENDS_FINISHES.map((finish, i) => (
                <Image
                  key={finish.src}
                  src={finish.src}
                  alt={i === 0 ? "LEGENDS — eagle emblem" : ""}
                  fill
                  sizes="(min-width: 1024px) 560px, 90vw"
                  className="legends-finish object-contain drop-shadow-[0_12px_18px_rgba(90,64,10,0.18)]"
                  style={{ animationDelay: `${i * 4}s` }}
                  priority={i === 0}
                />
              ))}
            </div>

            {/*
              The descriptor half of the lockup - the emblem already carries
              the word LEGENDS itself.

              Sits BELOW the artwork, never pulled up into it: all three finish
              images are cropped flush to the baseline of the wordmark, so a
              negative margin here lands the text on top of the letters. Width
              is capped to roughly the span from the E to the D so it reads as
              tucked under the middle of the word, and the type matches the
              KARETEK / M.TEK descriptors so the three cards read as a set.
            */}
            <h3 className="mx-auto mt-4 max-w-[13rem] text-center font-heading text-xs font-semibold uppercase tracking-[0.3em] text-ink-900/60 sm:mt-5 sm:max-w-[17rem] sm:text-sm">
              {lead.tagline}
            </h3>

            {/*
              First look at the range, so the card shows an actual product
              rather than only a wordmark. Links through to /legends, where the
              full preview and pricing live.
            */}
            {firstLook?.video && firstLook.image ? (
              <Link
                href="/legends"
                className="group/look mt-7 flex items-center gap-4 rounded-2xl border border-[#e8dcb8] bg-white/70 p-3 transition-colors hover:border-[#c9a227] sm:gap-5 sm:p-4"
              >
                <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-white sm:size-24">
                  <LazyVideo
                    src={firstLook.video}
                    poster={firstLook.image}
                    label={`${firstLook.name} in motion`}
                    className="size-full object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#b8901c]">
                    First look
                  </span>
                  <span className="mt-0.5 block truncate font-heading text-base font-extrabold text-ink-900 sm:text-lg">
                    {firstLook.name}
                  </span>
                  {firstLook.salePrice && firstLook.price ? (
                    <span className="mt-1 flex flex-wrap items-baseline gap-2">
                      <span className="font-heading text-base font-black text-ink-900">
                        {formatPkr(firstLook.salePrice)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPkr(firstLook.price)}
                      </span>
                    </span>
                  ) : null}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-ink-900/40 transition-transform group-hover/look:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            ) : null}

            <div className="mt-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="text-sm text-muted-foreground">
                  A new range is on its way — be the first to know.
                </p>
              </div>
              <Link
                href="/legends"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-700"
              >
                Discover LEGENDS
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </article>

          {/* KARETEK and M.TEK */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {others.map((brand) => (
              <article
                key={brand.slug}
                className="flex flex-col justify-between rounded-3xl border bg-ink-900 p-6 text-white sm:p-8"
              >
                <div className="flex justify-end">
                  <ComingSoonBadge />
                </div>
                <div className="py-8 text-center">
                  <p className="coming-soon-blink font-heading text-4xl font-black italic tracking-[0.08em] sm:text-5xl">
                    {brand.name}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-ink-300">
                    {brand.tagline}
                  </p>
                </div>
                <Link
                  href={`/legends?brand=${brand.slug}#notify`}
                  className="text-center text-sm font-medium text-[#e2c25b] underline-offset-4 hover:underline"
                >
                  Notify me when it launches
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
