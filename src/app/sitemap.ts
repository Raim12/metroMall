import type { MetadataRoute } from "next";

import { CATEGORIES, SITE } from "@/lib/constants";
import { getAllProductSlugs } from "@/lib/products";

/**
 * XML sitemap, served at /sitemap.xml and referenced from robots.ts.
 *
 * Only pages worth a search result appear here. Deliberately excluded:
 *   /admin                  — owner's dashboard
 *   /checkout, /checkout/*  — cart and order receipts
 *   /api/*                  — not pages
 *
 * Built from the live catalogue, so it tracks the database rather than a
 * hand-maintained list. `getAllProductSlugs` already filters to sellable
 * products, which keeps hidden and inactive items out.
 */

// Regenerate daily. The catalogue changes when the owner edits stock, not by
// the minute, and rebuilding ~1,200 entries on every request is wasteful.
export const revalidate = 86400;

const BASE = SITE.url.replace(/\/$/, "");

/** Pages that exist regardless of the catalogue. */
const STATIC_PATHS: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/catalogue", changeFrequency: "daily", priority: 0.9 },
  { path: "/legends", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/export", changeFrequency: "monthly", priority: 0.5 },
  { path: "/join-us", changeFrequency: "monthly", priority: 0.4 },
  { path: "/support/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/support/faq", changeFrequency: "monthly", priority: 0.5 },
];

const POLICY_SLUGS = ["privacy", "returns", "delivery", "terms"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = STATIC_PATHS.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  // Category landing pages are the catalogue filtered by category — the
  // highest-intent pages after the products themselves ("inverter ceiling
  // fans" rather than a single model).
  const categoryEntries = CATEGORIES.map((category) => ({
    url: `${BASE}/catalogue?category=${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const policyEntries = POLICY_SLUGS.map((slug) => ({
    url: `${BASE}/policies/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  // A sitemap that 500s is worse than one missing a section, so a database
  // problem degrades to the static pages rather than taking the whole file out.
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllProductSlugs();
    productEntries = slugs.map((slug) => ({
      url: `${BASE}/product/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("[sitemap] could not load product slugs:", error);
  }

  return [
    ...staticEntries,
    ...categoryEntries,
    ...policyEntries,
    ...productEntries,
  ];
}
