import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NotifyForm } from "@/components/legends/notify-form";
import { HOUSE_BRANDS, SITE } from "@/lib/constants";
import { BrandText } from "@/components/shared/brand-text";

export const metadata: Metadata = {
  title: "LEGENDS Home Appliances — Launching Soon",
  description:
    "LEGENDS, a quality new home appliance brand coming soon to Metro Electric Co. Get notified the moment it arrives.",
  openGraph: {
    title: "LEGENDS Home Appliances — Launching Soon",
    description: "A quality new home appliance brand coming soon to Metro Electric Co. Get notified at launch.",
    images: [{ url: "/brands/legends-gold.webp" }],
  },
};

/** Edge-cleaned for dark backgrounds (no pale fringe from the source photo). */
/*
 * Plain gold, not the "-dark" artwork: that one is lit for a black backdrop
 * and its edges read as a harsh fringe on the cream panel. Matches the hero
 * slide and the LEGENDS card in <HouseBrands />.
 */
const EMBLEM = "/brands/legends-gold.webp";

/**
 * Teaser page for the new brands coming to the range, led by LEGENDS.
 * Shareable on its own
 * (social ads, WhatsApp status); sign-ups land in Admin → Launch list.
 */
export default async function LegendsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const others = HOUSE_BRANDS.filter((b) => !b.lead);

  return (
    <div className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,#fffdf6_0%,#f6efdc_55%,#ecdfba_100%)]">
      {/* Fine gold rule framing the top */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />

      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to shop
        </Link>

        {/* ------------------------------- Hero ------------------------------ */}
        <section className="mt-6 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#c9a227]">
            <BrandText>{SITE.shortName}</BrandText> presents
          </p>

          <div className="relative mx-auto mt-6 aspect-[10/7] w-full max-w-2xl">
            <Image
              src={EMBLEM}
              alt="LEGENDS"
              fill
              priority
              sizes="(min-width: 768px) 672px, 92vw"
              className="object-contain drop-shadow-[0_14px_22px_rgba(90,64,10,0.18)]"
            />
            <span
              aria-hidden
              className="legends-shimmer"
              style={{ "--shimmer-mask": `url(${EMBLEM})` } as React.CSSProperties}
            />
            {/* Registered mark, set against the top-right of the wordmark. */}
            <span className="absolute right-[12%] top-[14%] font-heading text-base font-bold text-[#8a6d12] sm:text-xl">
              &reg;
            </span>
          </div>

          {/*
            Sits tight under the wordmark and no wider than it, so it reads as
            part of the lockup rather than a separate line - centred across the
            E and the D rather than the whole column.
          */}
          <p className="-mt-1 mx-auto max-w-[19rem] text-sm font-semibold uppercase tracking-[0.42em] text-[#8a6d12] sm:max-w-sm">
            Home Appliances
          </p>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight sm:text-6xl">
            Launching{" "}
            <span className="inline-block animate-pulse bg-gradient-to-r from-[#8a6d12] via-[#c9a227] to-[#8a6d12] bg-clip-text italic text-transparent">
              soon
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            A quality new home appliance brand coming soon to {SITE.name} Be the first to know when it arrives.
          </p>
        </section>

        {/* ------------------------------ Notify ----------------------------- */}
        <section
          id="notify"
          className="mx-auto mt-12 max-w-xl scroll-mt-28 rounded-3xl border border-[#e8dcb8] bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8"
        >
          <h2 className="text-center font-heading text-xl font-extrabold">Get notified at launch</h2>
          <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">
            Leave your number and we&apos;ll message you on launch day.
          </p>
          {/* key: picking another brand from "Also coming" re-opens the form on it. */}
          <NotifyForm key={brand ?? "legends"} defaultBrand={brand} />
        </section>

        {/* --------------------------- Also coming --------------------------- */}
        <section className="mt-16 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#8a6d12]">
            Also coming from <BrandText>{SITE.shortName}</BrandText>
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {others.map((b) => (
              <Link
                key={b.slug}
                href={`/legends?brand=${b.slug}#notify`}
                scroll={false}
                className="group rounded-2xl border border-[#e8dcb8] bg-white/60 px-6 py-8 transition-colors hover:border-[#c9a227]"
              >
                <p className="font-heading text-3xl font-black italic tracking-[0.08em] sm:text-4xl">{b.name}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {b.tagline} · <span className="text-[#b8901c]">Coming soon</span>
                </p>
                <p className="mt-4 text-sm text-muted-foreground transition-colors group-hover:text-ink-900">
                  Get notified →
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
