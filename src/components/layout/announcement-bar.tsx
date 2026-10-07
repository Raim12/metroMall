"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Site-wide strip above the header announcing the LEGENDS launch, with a
 * blinking "Coming soon" light. Links to the LEGENDS teaser page. Hidden in
 * the admin panel.
 */
export function AnnouncementBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <Link
      href="/legends"
      className="group block bg-ink-900 text-ink-100 print:hidden"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-2.5 px-4 py-2 text-center text-xs sm:text-sm">
        <span
          className="coming-soon-blink size-2 shrink-0 rounded-full bg-[#c9a227]"
          aria-hidden
        />
        <span>
          <span className="font-heading font-black italic tracking-wide text-[#e2c25b]">LEGENDS</span>{" "}
          Home Appliances —{" "}
          <span className="font-semibold uppercase tracking-wider text-white">Coming soon</span>
        </span>
        <span className="hidden text-ink-300 transition-colors group-hover:text-white sm:inline" aria-hidden>
          →
        </span>
      </div>
    </Link>
  );
}
