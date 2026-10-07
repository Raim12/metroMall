import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NotifyForm } from "@/components/legends/notify-form";
import { HOUSE_BRANDS, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "LEGENDS Home Appliances — Launching Soon",
  description:
    "LEGENDS, the home appliance brand from Metro Electric Co., is launching soon. Get notified the moment it arrives.",
  openGraph: {
    title: "LEGENDS Home Appliances — Launching Soon",
    description: "The home appliance brand from Metro Electric Co. Get notified at launch.",
    images: [{ url: "/brands/legends-gold.webp" }],
  },
};

/** Edge-cleaned for dark backgrounds (no pale fringe from the source photo). */
const EMBLEM = "/brands/legends-gold-dark.webp";

/**
 * Teaser page for Metro's own brands, led by LEGENDS. Shareable on its own
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
    <div className="relative isolate overflow-hidden bg-[#0d0b09] text-white">
      {/* Warm gold glow behind the emblem */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(ellipse_at_50%_35%,rgba(201,162,39,0.28)_0%,rgba(201,162,39,0.08)_35%,transparent_65%)]"
      />
      {/* Fine gold rule framing the top */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a227]/60 to-transparent" />

      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to shop
        </Link>

        {/* ------------------------------- Hero ------------------------------ */}
        <section className="mt-6 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#c9a227]">
            {SITE.shortName} presents
          </p>

          <div className="relative mx-auto mt-6 aspect-[10/7] w-full max-w-2xl">
            <Image
              src={EMBLEM}
              alt="LEGENDS"
              fill
              priority
              sizes="(min-width: 768px) 672px, 92vw"
              className="object-contain drop-shadow-[0_20px_40px_rgba(201,162,39,0.25)]"
            />
            <span
              aria-hidden
              className="legends-shimmer"
              style={{ "--shimmer-mask": `url(${EMBLEM})` } as React.CSSProperties}
            />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            Home Appliances
          </p>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight sm:text-6xl">
            Launching{" "}
            <span className="inline-block animate-pulse bg-gradient-to-r from-[#e2c25b] via-[#f6e3a1] to-[#c9a227] bg-clip-text italic text-transparent">
              soon
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/65">
            The home appliance brand from {SITE.name} Be the first to know when it arrives.
          </p>
        </section>

        {/* ------------------------------ Notify ----------------------------- */}
        <section
          id="notify"
          className="mx-auto mt-12 max-w-xl scroll-mt-28 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8"
        >
          <h2 className="text-center font-heading text-xl font-extrabold">Get notified at launch</h2>
          <p className="mb-6 mt-1 text-center text-sm text-white/55">
            Leave your number and we&apos;ll message you on launch day.
          </p>
          {/* key: picking another brand from "Also coming" re-opens the form on it. */}
          <NotifyForm key={brand ?? "legends"} defaultBrand={brand} />
        </section>

        {/* --------------------------- Also coming --------------------------- */}
        <section className="mt-16 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/45">
            Also coming from {SITE.shortName}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {others.map((b) => (
              <Link
                key={b.slug}
                href={`/legends?brand=${b.slug}#notify`}
                scroll={false}
                className="group rounded-2xl border border-white/10 px-6 py-8 transition-colors hover:border-[#c9a227]/50"
              >
                <p className="font-heading text-3xl font-black italic tracking-[0.08em] sm:text-4xl">{b.name}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                  {b.tagline} · <span className="text-[#e2c25b]">Coming soon</span>
                </p>
                <p className="mt-4 text-sm text-white/55 transition-colors group-hover:text-white">
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
