import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

/**
 * Official Metro Electric Co. wordmark (`/public/logo.svg`).
 *
 * The artwork is black with orange accents, so it only reads on light
 * backgrounds. `tone="light"` (used in the footer, over dark teal) sets it on a
 * white plate rather than inverting it — that keeps the orange bolt and rule,
 * which a `brightness-0 invert` filter would flatten to white.
 *
 * The SVG is served unoptimized: Next's image optimizer rejects SVG unless
 * `dangerouslyAllowSVG` is enabled globally, and there is nothing to gain by
 * re-encoding vector art.
 */
export function Logo({
  className,
  tone = "dark",
  href = "/",
}: {
  /** Applied to the <Image> — set the height here, e.g. `h-14 w-auto`. */
  className?: string;
  tone?: "dark" | "light";
  href?: string | null;
}) {
  const image = (
    <Image
      src="/logo.svg"
      alt={`${SITE.name} logo`}
      width={320}
      height={120}
      priority
      unoptimized
      className={cn("h-12 w-auto sm:h-14", className)}
    />
  );

  const content =
    tone === "light" ? (
      <span className="inline-flex rounded-xl bg-white px-3 py-2 shadow-sm">
        {image}
      </span>
    ) : (
      image
    );

  if (!href) return content;

  return (
    <Link
      href={href}
      aria-label={`${SITE.name} — home`}
      className="inline-flex shrink-0 items-center"
    >
      {content}
    </Link>
  );
}
