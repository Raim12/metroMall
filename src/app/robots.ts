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

function canonicalHost(): string {
  return new URL(SITE.url).host;
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

  // `host` is what the browser asked for; Render sets `x-forwarded-host` when
  // proxying, so prefer it and fall back for local use.
  const headerList = await headers();
  const host = (
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    ""
  ).toLowerCase();

  const expected = canonicalHost().toLowerCase();
  const onCanonicalHost = host === expected || host === `www.${expected}`;

  if (!allowIndexing || !onCanonicalHost) {
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
