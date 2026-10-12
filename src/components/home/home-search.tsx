import Link from "next/link";

import { SiteSearch } from "@/components/layout/site-search";

/** Quick links under the homepage search box. */
const SHORTCUTS = [
  { label: "Inverter fans", href: "/catalogue?category=ceiling-fans-inverter" },
  { label: "AC/DC fans", href: "/catalogue?category=ceiling-fans-acdc" },
  { label: "Geysers", href: "/catalogue?category=water-heaters" },
  { label: "Air coolers", href: "/catalogue?category=air-coolers" },
  { label: "Gas hobs", href: "/catalogue?category=gas-hobs" },
  { label: "Washing machines", href: "/catalogue?category=washing-machines" },
];

/** Prominent search at the top of the homepage. */
export function HomeSearch() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SiteSearch size="lg" />
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 self-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular:
          </span>
          {SHORTCUTS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="shrink-0 rounded-full border bg-white px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-brand-300 hover:text-brand-700"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
