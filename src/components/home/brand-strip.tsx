import Link from "next/link";

import { Section, SectionHeading } from "@/components/shared/section-heading";
import { BRANDS, UPCOMING_BRANDS } from "@/lib/constants";

/**
 * "Shop by brand" — one tile per brand we stock, linking to its filtered
 * catalogue, followed by any brand announced before its stock arrives. The
 * upcoming ones are not links: their catalogue page would be empty.
 */
export function BrandStrip({ counts }: { counts: Record<string, number> }) {
  const brands = BRANDS.filter((b) => counts[b.slug]);
  const upcoming = BRANDS.filter(
    (b) => !counts[b.slug] && (UPCOMING_BRANDS as readonly string[]).includes(b.slug),
  );

  return (
    <Section className="bg-white">
      <SectionHeading
        eyebrow="Authorised dealer"
        title="Shop by"
        highlight="Brand"
        description="Genuine products from the brands Pakistan trusts."
      />

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {brands.map((brand) => (
          <li key={brand.slug}>
            <Link
              href={`/catalogue?brand=${brand.slug}`}
              className="group flex h-full flex-col items-center justify-center rounded-2xl border bg-white px-4 py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg hover:shadow-ink-950/5"
            >
              <span className="font-heading text-lg font-extrabold uppercase tracking-tight text-ink-900 transition-colors group-hover:text-brand-700">
                {brand.name}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {counts[brand.slug]} products
              </span>
            </Link>
          </li>
        ))}

        {upcoming.map((brand) => (
          <li key={brand.slug}>
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed bg-white px-4 py-6 text-center">
              <span className="font-heading text-lg font-extrabold uppercase tracking-tight text-ink-900/70">
                {brand.name}
              </span>
              <span className="mt-1 text-xs font-semibold text-brand-600">
                Coming soon
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
