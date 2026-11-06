import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { SELLABLE } from "@/lib/sellable";
import { CATEGORY_TO_SLUG } from "@/lib/category-map";
import { brandName } from "@/lib/constants";

/**
 * GET /api/search/suggest?q=crystal
 *
 * Typeahead for the search box. Deliberately separate from /api/products,
 * which loads every product and filters in JavaScript - fine for a one-off
 * request, far too heavy to run on every keystroke against 1,200 products.
 *
 * This hits the database with a LIMIT and selects only the handful of columns
 * the dropdown draws, so the response stays small enough to feel instant.
 */

/** Rows returned to the dropdown. Keep in step with `SiteSearch`. */
export type Suggestion = {
  slug: string;
  name: string;
  brand: string;
  brandName: string;
  category: string;
  price: number;
  image: string | null;
};

const LIMIT = 8;

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  // One character matches most of the catalogue, which is noise rather than a
  // suggestion. The box shows nothing until there is something to narrow by.
  if (q.length < 2) {
    return NextResponse.json({ query: q, suggestions: [] as Suggestion[] });
  }

  try {
    const rows = await prisma.product.findMany({
      where: {
        ...SELLABLE,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tagline: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        slug: true,
        name: true,
        brand: true,
        category: true,
        price: true,
        images: true,
      },
      // Featured first so a vague query surfaces the products we actually push.
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      take: LIMIT,
    });

    const suggestions: Suggestion[] = rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      brand: r.brand,
      brandName: brandName(r.brand),
      category: CATEGORY_TO_SLUG[r.category] ?? r.category,
      price: r.price,
      image: r.images[0] ?? null,
    }));

    return NextResponse.json(
      { query: q, suggestions },
      {
        headers: {
          // Short cache: the same few prefixes get typed constantly, and a
          // minute-stale price in a dropdown is harmless - the product page is
          // the source of truth.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("[api/search/suggest]", error);
    // A dead dropdown must not break typing, so this fails quiet: the form
    // still submits through to the full catalogue search.
    return NextResponse.json({ query: q, suggestions: [] as Suggestion[] }, { status: 200 });
  }
}
