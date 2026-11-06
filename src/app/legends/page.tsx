import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NotifyForm } from "@/components/legends/notify-form";
import { HOUSE_BRANDS, SITE, productEnquiryLink } from "@/lib/constants";
import { LEGENDS_PREVIEW } from "@/lib/legends-preview";
import { formatPkr } from "@/lib/utils";
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
            A quality new home appliance brand coming soon to <BrandText>{SITE.name}</BrandText> Be the first to know when it arrives.
          </p>
        </section>

        {/* ----------------------------- First look --------------------------- */}
        {LEGENDS_PREVIEW.length > 0 ? (
          <section className="mt-16">
            <div className="text-center">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[#8a6d12]">
                First look
              </p>
              <h2 className="mt-3 font-heading text-2xl font-extrabold sm:text-3xl">
                The first <span className="italic text-[#b8901c]">LEGENDS</span> models
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
                Launch pricing, shown ahead of release. These are not on sale
                yet — message us on WhatsApp to reserve one or ask about it.
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {LEGENDS_PREVIEW.map((item) => (
                <article
                  key={item.slug}
                  className="overflow-hidden rounded-3xl border border-[#e8dcb8] bg-white/70 shadow-sm backdrop-blur-sm"
                >
                  <div className="relative aspect-square bg-white">
                    {item.video && item.image ? (
                      /*
                        Muted, looping and inline: this is product footage, not
                        something to sit and watch, so it behaves like a moving
                        photograph. `poster` holds the still until the first
                        frame decodes, and a browser that blocks autoplay shows
                        that still instead of an empty box.
                      */
                      <video
                        src={item.video}
                        poster={item.image}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label={`${item.name} in motion`}
                        className="size-full object-cover"
                      />
                    ) : item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 640px) 45vw, 92vw"
                        className="object-cover"
                      />
                    ) : (
                      /* Listed before its photo arrives: a labelled panel
                         rather than an empty frame, so the gap looks intended. */
                      <div className="grid h-full place-items-center bg-[#faf6ea] text-center">
                        <span className="px-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8901c]">
                          Photo coming soon
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="font-heading text-lg font-extrabold">{item.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.blurb}
                    </p>

                    {item.price ? (
                      <p className="mt-4 flex flex-wrap items-baseline gap-2">
                        {item.salePrice ? (
                          <>
                            <span className="font-heading text-2xl font-black text-ink-900">
                              {formatPkr(item.salePrice)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPkr(item.price)}
                            </span>
                            <span className="rounded-full bg-[#c9a227] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-900">
                              Save {formatPkr(item.price - item.salePrice)}
                            </span>
                          </>
                        ) : (
                          <span className="font-heading text-2xl font-black text-ink-900">
                            {formatPkr(item.price)}
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="mt-4 text-sm font-semibold text-[#b8901c]">
                        Price on enquiry
                      </p>
                    )}

                    <a
                      href={productEnquiryLink(`LEGENDS ${item.name}`)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-700"
                    >
                      Enquire on WhatsApp
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

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
                <p className="coming-soon-blink font-heading text-3xl font-black italic tracking-[0.08em] sm:text-4xl">{b.name}</p>
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
