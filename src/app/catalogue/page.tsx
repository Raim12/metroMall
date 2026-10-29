import type { Metadata } from "next";
import { cache } from "react";

import { CatalogueBrowser } from "@/components/product/catalogue-browser";
import { CtaBanner } from "@/components/home/cta-banner";
import { getCatalogue, getCatalogueFacets, type CatalogueSort } from "@/lib/products";
import { BRANDS, categoryBySlug } from "@/lib/constants";
import { catalogueCanonical, catalogueSeo } from "@/lib/seo";
import type { CategorySlug } from "@/types";

/*
 * Rendered per request: filtering, search and paging all come from the URL,
 * and only the current page of products is sent to the browser.
 */
export const dynamic = "force-dynamic";

const SORTS: CatalogueSort[] = ["featured", "price-asc", "price-desc", "newest"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parse(params: Awaited<SearchParams>) {
  const category = one(params.category);
  const brand = one(params.brand);
  const sort = one(params.sort) as CatalogueSort | undefined;
  return {
    category: categoryBySlug(category ?? "") ? (category as CategorySlug) : undefined,
    brand: BRANDS.some((b) => b.slug === brand) ? brand : undefined,
    q: one(params.q)?.slice(0, 80) || undefined,
    sort: sort && SORTS.includes(sort) ? sort : "featured",
    page: Math.max(1, Number.parseInt(one(params.page) ?? "1", 10) || 1),
  };
}

// Metadata and the page need the same query; cache() runs it once per request.
const loadCatalogue = cache(
  (category?: CategorySlug, brand?: string, q?: string, sort?: CatalogueSort, page?: number) =>
    getCatalogue({ category, brand, q, sort, page }),
);

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const f = parse(await searchParams);
  const { total } = await loadCatalogue(f.category, f.brand, f.q, f.sort, f.page);
  const seo = catalogueSeo({ brand: f.brand, category: f.category, count: total });
  const canonical = catalogueCanonical(f.brand, f.category);
  return {
    title: { absolute: `${seo.title} | Metro Electric Co.` },
    description: seo.description,
    alternates: { canonical },
    openGraph: { title: seo.title, description: seo.description, url: canonical },
    // Search results and empty filters are thin pages: keep them out of
    // Google's index, but let it follow the product links.
    ...(f.q || total === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CataloguePage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parse(await searchParams);
  const [result, facets] = await Promise.all([
    loadCatalogue(filters.category, filters.brand, filters.q, filters.sort, filters.page),
    getCatalogueFacets(filters.category),
  ]);
  const seo = catalogueSeo({ brand: filters.brand, category: filters.category, count: result.total });

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
            {seo.h1}
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{seo.intro}</p>
        </header>

        <CatalogueBrowser
          products={result.products}
          total={result.total}
          page={result.page}
          pageCount={result.pageCount}
          facets={facets}
          filters={filters}
        />
      </div>

      <CtaBanner
        title="Bulk, corporate or dealer pricing?"
        body="Tell us the products and quantities — our team will send you a quote within one business day."
        cta="Send a bulk query"
        href="/wholesale"
      />
    </>
  );
}
