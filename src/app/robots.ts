import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { SITE } from "@/lib/constants";

/**
 * Search-engine policy.
 *
 * Two independent gates, both of which must pass before anything is indexed:
 *
 *  1. `NEXT_PUBLIC_ALLOW_INDEXING` must be exactly "true". The default is the
 *     safe one: a review deployment carries placeholder copy and test orders,
 *     and getting that indexed under the client's brand is hard to undo.
 *
 *  2. The request must arrive on the canonical production host. Render serves
 *     the same instance on its own *.onrender.com subdomain as well as the real
 *     domain, so without this check enabling indexing would publish the site at
 *     two addresses and have them compete as duplicate content. Canonical tags
 *     alone are a hint; a disallow is not.
 */

// Reads the request host, so it cannot be statically generated at build time.
export const dynamic = "force-dynamic";

const BLOCKED_FROM_INDEX = ["/admin", "/admin/", "/checkout", "/api/"];

/** Hosts that must never be indexed, whatever the flag says. */
function isPreviewHost(host: string): boolean {
  // Render's own subdomain for this service, and anything that isn't a real
  // domain. Everything else is treated as a production domain the owner has
  // deliberately pointed here.
  return host === "" || host.endsWith(".onrender.com") || host === "localhost";
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

  // `host` is what the browser asked for; Render sets `x-forwarded-host` when
  // proxying. Through more than one proxy it can be a comma-separated list, so
  // take the first entry, and drop any port.
  const headerList = await headers();
  const host = (headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

  /*
   * Deliberately a deny-list, not an allow-list.
   *
   * Matching the canonical host exactly meant any mismatch — a www variant, a
   * second domain, a proxy spelling the header differently — silently served
   * "Disallow: /" with nothing to show why. Blocking only the hosts that must
   * never be indexed keeps the duplicate-content protection without making
   * every other host fail closed and invisible.
   */
  const blocked = !allowIndexing || isPreviewHost(host);

  // One line in the server log, so "why is the site still disallowed?" is
  // answerable from Render's logs rather than by guesswork.
  console.info(
    `[robots] host=${host || "(none)"} allowIndexing=${allowIndexing} -> ${blocked ? "disallow" : "allow"}`,
  );

  if (blocked) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: BLOCKED_FROM_INDEX,
      },
    ],
    sitemap: `${SITE.url.replace(/\/$/, "")}/sitemap.xml`,
    host: SITE.url.replace(/\/$/, ""),
  };
}
