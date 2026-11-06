"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PROMO } from "@/lib/constants";

/**
 * Site-wide strip above the header: the current offer, then the LEGENDS
 * launch teaser. Hidden in the admin panel.
 *
 * The offer leads because it is the only part a shopper can act on today;
 * LEGENDS is an announcement about something that does not exist yet.
 */
export function AnnouncementBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="print:hidden">
      {PROMO.active ? (
        <Link
          href={PROMO.href}
          className="group block bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 text-white"
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-2.5 px-4 py-2 text-center text-xs sm:text-sm">
            {/*
              The flashing dot carries the urgency, so the text itself can stay
              still - a whole blinking sentence is hard to read and harder to
              ignore.
            */}
            <span
              className="coming-soon-blink size-2 shrink-0 rounded-full bg-white"
              aria-hidden
            />
            <span>
              <span className="font-heading font-black uppercase italic tracking-wide">
                {PROMO.headline}
              </span>{" "}
              <span className="text-white/90">{PROMO.detail}</span>
            </span>
            <span
              className="hidden font-semibold underline-offset-2 group-hover:underline sm:inline"
              aria-hidden
            >
              Shop now →
            </span>
          </div>
        </Link>
      ) : null}

      <Link href="/legends" className="group block bg-ink-900 text-ink-100">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-2.5 px-4 py-2 text-center text-xs sm:text-sm">
          <span
            className="coming-soon-blink size-2 shrink-0 rounded-full bg-[#c9a227]"
            aria-hidden
          />
          <span>
            <span className="font-heading font-black italic tracking-wide text-[#e2c25b]">
              LEGENDS
            </span>{" "}
            Home Appliances —{" "}
            <span className="font-semibold uppercase tracking-wider text-white">Coming soon</span>
          </span>
          <span
            className="hidden text-ink-300 transition-colors group-hover:text-white sm:inline"
            aria-hidden
          >
            →
          </span>
        </div>
      </Link>
    </div>
  );
}
