import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders text with every occurrence of "Metro" set in the logo typeface.
 *
 * The brand name reaches the page as a plain string in dozens of places
 * (`SITE.name`, headings, body copy), so rather than hand-wrapping each one,
 * this splits on the word and styles just that part. Everything else keeps the
 * surrounding font, which matters: Bazooka is a display face and a whole
 * sentence set in it is close to unreadable.
 *
 * Only for visible text. Page titles, alt attributes and meta descriptions are
 * strings, not elements, so they keep using `SITE.name` directly.
 */

const BRAND_WORD = /(Metro)/g;

export function BrandText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const parts = children.split(BRAND_WORD);

  return (
    <>
      {parts.map((part, i) =>
        part === "Metro" ? (
          <span key={i} className={cn("font-brand", className)}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}
