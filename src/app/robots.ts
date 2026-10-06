import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

/**
 * Search-engine policy.
 *
 * Indexing is OFF unless `NEXT_PUBLIC_ALLOW_INDEXING` is explicitly "true".
 * The default is deliberately the safe one: a client-review deployment carries
 * placeholder copy and test orders, and getting that indexed under the client's
 * brand is hard to undo. Set the flag only on the real production domain.
 */
export default function robots(): MetadataRoute.Robots {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;

  if (!allowIndexing) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Never index the owner's dashboard, the cart, or order receipts.
        disallow: ["/admin", "/admin/", "/checkout", "/api/"],
      },
    ],
    sitemap: `${base.replace(/\/$/, "")}/sitemap.xml`,
  };
}
