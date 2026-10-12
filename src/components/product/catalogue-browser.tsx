"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutGrid, Search, SlidersHorizontal, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { BRANDS, CATEGORIES, CATEGORY_GROUPS, brandName, categoryBySlug } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CatalogueSort } from "@/lib/products";
import type { CategorySlug, Product } from "@/types";

const SORTS: { key: CatalogueSort; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "newest", label: "Newest" },
];

interface Filters {
  category?: CategorySlug;
  brand?: string;
  q?: string;
  sort: CatalogueSort;
  page: number;
}

/** Builds a catalogue URL from the current filters plus overrides. */
function hrefFor(filters: Filters, patch: Partial<Filters>) {
  const next = { ...filters, page: 1, ...patch };
  const params = new URLSearchParams();
  if (next.category) params.set("category", next.category);
  if (next.brand) params.set("brand", next.brand);
  if (next.q) params.set("q", next.q);
  if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/catalogue?${qs}` : "/catalogue";
}

export function CatalogueBrowser({
  products,
  total,
  page,
  pageCount,
  facets,
  filters,
}: {
  products: Product[];
  total: number;
  page: number;
  pageCount: number;
  facets: { categories: Partial<Record<CategorySlug, number>>; brands: Record<string, number> };
  filters: Filters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = React.useTransition();
  const [query, setQuery] = React.useState(filters.q ?? "");
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  // Keep the box in sync when the URL changes (back button, chip removal).
  React.useEffect(() => setQuery(filters.q ?? ""), [filters.q]);

  const go = (patch: Partial<Filters>) =>
    startTransition(() => router.push(hrefFor(filters, patch), { scroll: false }));

  // Search as you type, but only after a pause.
  React.useEffect(() => {
    const value = query.trim();
    if (value === (filters.q ?? "")) return;
    const id = window.setTimeout(() => {
      startTransition(() =>
        router.replace(hrefFor(filters, { q: value || undefined }), { scroll: false }),
      );
    }, 350);
    return () => window.clearTimeout(id);
  }, [query, filters, router]);

  const activeChips = [
    filters.brand && { label: brandName(filters.brand), clear: { brand: undefined } },
    filters.category && {
      label: categoryBySlug(filters.category)?.name ?? filters.category,
      clear: { category: undefined },
    },
    filters.q && { label: `“${filters.q}”`, clear: { q: undefined } },
  ].filter(Boolean) as { label: string; clear: Partial<Filters> }[];

  const sidebar = (
    <nav aria-label="Product filters" className="space-y-7">
      {/* Brands first: shoppers here mostly know which brand they want. */}
      <div>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Brands
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.filter((b) => facets.brands[b.slug]).map((b) => (
            <Link
              key={b.slug}
              href={hrefFor(filters, { brand: filters.brand === b.slug ? undefined : b.slug })}
              scroll={false}
              onClick={() => setFiltersOpen(false)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filters.brand === b.slug
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "bg-white hover:border-brand-300 hover:text-brand-700",
              )}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
      {CATEGORY_GROUPS.map(({ group, title }) => {
        const stocked = CATEGORIES.filter((c) => c.group === group && facets.categories[c.slug]);
        // Lights are announced before they are stocked; other empty categories stay hidden.
        const upcoming =
          group === "lights" || group === "electrical"
            ? CATEGORIES.filter((c) => c.group === group && !facets.categories[c.slug])
            : [];
        if (!stocked.length && !upcoming.length) return null;
        return (
        <div key={group}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </h2>
          <ul className="space-y-0.5">
            {upcoming.map((c) => (
              <li
                key={c.slug}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground"
              >
                {c.name}
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[0.65rem] font-semibold text-brand-700">
                  Coming soon
                </span>
              </li>
            ))}
            {stocked.map((c) => (
              <li key={c.slug}>
                <Link
                  href={hrefFor(filters, {
                    category: filters.category === c.slug ? undefined : c.slug,
                  })}
                  scroll={false}
                  onClick={() => setFiltersOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                    filters.category === c.slug
                      ? "bg-brand-600 font-semibold text-white"
                      : "hover:bg-muted",
                  )}
                >
                  {c.name}
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      filters.category === c.slug ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {facets.categories[c.slug]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        );
      })}

    </nav>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
      <aside className="hidden lg:block">{sidebar}</aside>

      <div className="min-w-0">
        {/* One-tap brand filter. Only brands with products in the current view. */}
        <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <Link
            href={hrefFor(filters, { brand: undefined })}
            scroll={false}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              !filters.brand ? "border-brand-600 bg-brand-600 text-white" : "bg-white hover:border-brand-300",
            )}
          >
            All brands
          </Link>
          {BRANDS.filter((b) => facets.brands[b.slug]).map((b) => (
            <Link
              key={b.slug}
              href={hrefFor(filters, { brand: filters.brand === b.slug ? undefined : b.slug })}
              scroll={false}
              aria-current={filters.brand === b.slug ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                filters.brand === b.slug
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "bg-white hover:border-brand-300 hover:text-brand-700",
              )}
            >
              {b.name}
            </Link>
          ))}
        </div>

        {/* Toolbar */}
        {/*
          Phones: search on its own full-width row, then Filters and Sort sharing
          the next row at equal width. All three are 44px tall with matching
          corners. From sm up everything sits on one compact row.
        */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-2">
          {/* Own full-width row on phones; it was squeezed to just its icon there. */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              go({ q: query.trim() || undefined });
            }}
            className="relative w-full sm:w-auto sm:min-w-0 sm:max-w-xs sm:flex-1"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or brands…"
              aria-label="Search products"
              className="h-11 rounded-lg pl-9 pr-8 sm:h-9 sm:rounded-md [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            ) : null}
          </form>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="h-11 flex-1 gap-2 rounded-lg sm:h-9 sm:flex-none sm:rounded-md lg:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Filters
            </Button>

            <label className="sr-only" htmlFor="sort">
              Sort products
            </label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => go({ sort: e.target.value as CatalogueSort })}
              className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm font-medium shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:h-9 sm:flex-none sm:rounded-md"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <span className="ml-auto hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
            <LayoutGrid className="size-4" aria-hidden />
            {total} {total === 1 ? "product" : "products"}
          </span>
        </div>

        {filtersOpen ? (
          <div className="mt-4 rounded-xl border bg-muted/40 p-4 lg:hidden">{sidebar}</div>
        ) : null}

        {activeChips.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Showing</span>
            {activeChips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700"
              >
                {chip.label}
                <Link
                  href={hrefFor(filters, chip.clear)}
                  scroll={false}
                  aria-label={`Clear ${chip.label} filter`}
                  className="rounded-full hover:text-ink-900"
                >
                  <X className="size-3.5" aria-hidden />
                </Link>
              </span>
            ))}
            <Link href={pathname} className="text-xs text-muted-foreground underline hover:text-foreground">
              Clear all
            </Link>
          </div>
        ) : null}

        {/* Grid */}
        <div className={cn("transition-opacity", pending && "opacity-60")} aria-busy={pending}>
          {products.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <div className="grid size-16 place-items-center rounded-full bg-muted">
                <Search className="size-7 text-muted-foreground" aria-hidden />
              </div>
              <p className="font-semibold">No products match that search</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try a different keyword, or clear the filters to see the full range.
              </p>
              <Button variant="outline" asChild>
                <Link href="/catalogue">Reset filters</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 3} className="h-full" />
              ))}
            </div>
          )}
        </div>

        {pageCount > 1 ? (
          <nav aria-label="Pages" className="mt-10 flex items-center justify-center gap-1.5">
            <PageLink filters={filters} page={page - 1} disabled={page <= 1} label="Previous page">
              <ChevronLeft className="size-4" aria-hidden />
            </PageLink>
            {pageWindow(page, pageCount).map((p, i) =>
              p === null ? (
                <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <PageLink key={p} filters={filters} page={p} current={p === page} label={`Page ${p}`}>
                  {p}
                </PageLink>
              ),
            )}
            <PageLink filters={filters} page={page + 1} disabled={page >= pageCount} label="Next page">
              <ChevronRight className="size-4" aria-hidden />
            </PageLink>
          </nav>
        ) : null}
      </div>
    </div>
  );
}

/** 1 … 4 5 [6] 7 8 … 20 */
function pageWindow(page: number, count: number): (number | null)[] {
  const pages = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

function PageLink({
  filters,
  page,
  current,
  disabled,
  label,
  children,
}: {
  filters: Filters;
  page: number;
  current?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className = cn(
    "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-medium transition-colors",
    current ? "border-brand-600 bg-brand-600 text-white" : "bg-white hover:border-brand-300",
    disabled && "pointer-events-none opacity-40",
  );
  if (disabled) {
    return (
      <span className={className} aria-label={label} aria-disabled>
        {children}
      </span>
    );
  }
  return (
    <Link href={hrefFor(filters, { page })} aria-label={label} aria-current={current ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}
