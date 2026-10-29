import { SHOWCASE_BRANDS, SITE, brandListText, brandName, categoryBySlug } from "@/lib/constants";
import type { CategorySlug, Product } from "@/types";

/**
 * Search-engine text and structured data, in one place so every page follows
 * the same patterns.
 *
 * Titles mirror how people search in Pakistan: "<brand> <product> price in
 * Pakistan <year>". The year is computed, so titles never go stale.
 */

const BASE = SITE.url.replace(/\/$/, "");
export const absoluteUrl = (path: string) => `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

const year = () => new Date().getFullYear();

/* ------------------------------ Catalogue ------------------------------ */

export function catalogueSeo({
  brand,
  category,
  count,
}: {
  brand?: string;
  category?: CategorySlug;
  count: number;
}) {
  const b = brand ? brandName(brand) : undefined;
  const c = category ? categoryBySlug(category) : undefined;
  const models = count > 0 ? `${count} model${count === 1 ? "" : "s"}` : "The latest models";

  let h1: string;
  let title: string;
  let lead: string;

  if (b && c) {
    h1 = `${b} ${c.name}`;
    title = `${b} ${c.name} Price in Pakistan ${year()}`;
    lead = `Buy genuine ${b} ${c.name} at dealer prices.`;
  } else if (c) {
    h1 = c.name;
    title = `${c.name} Price in Pakistan ${year()} — All Brands`;
    lead = `Compare ${c.name} from Pakistan's leading brands at dealer prices. ${c.blurb}`;
  } else if (b) {
    h1 = `${b} Products`;
    title = `${b} Price in Pakistan ${year()} — Authorized Dealer`;
    lead = `Buy genuine ${b} fans and home appliances at dealer prices.`;
  } else {
    h1 = "Products Catalogue";
    title = `Fans & Home Appliances Price in Pakistan ${year()}`;
    lead = `Genuine fans, home and gas appliances from ${brandListText(SHOWCASE_BRANDS)} at dealer prices.`;
  }

  const intro = `${lead} ${models}, all with official brand warranty — from ${SITE.name}, authorized dealer, retailer and wholesaler. Cash on Delivery in Karachi, delivery across Pakistan.`;
  return { h1, title, description: intro, intro };
}

/** Canonical URL for a listing: brand/category only — never sort, page or search. */
export function catalogueCanonical(brand?: string, category?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (brand) params.set("brand", brand);
  const qs = params.toString();
  return absoluteUrl(qs ? `/catalogue?${qs}` : "/catalogue");
}

/* ------------------------------- Products ------------------------------ */

export function productSeo(product: Product) {
  const b = brandName(product.brand);
  const priced = product.price > 0;
  const name = product.name.toLowerCase().startsWith(b.toLowerCase().split(" ")[0])
    ? product.name
    : `${b} ${product.name}`;
  const title = `${name} Price in Pakistan`;
  const price = priced ? `Rs. ${product.price.toLocaleString("en-PK")}` : "Price coming soon";
  const description = `${name} — ${price}. Genuine ${b} ${categoryBySlug(product.category)?.singular.toLowerCase() ?? "product"} with official brand warranty from ${SITE.name}, authorized dealer, retailer and wholesaler. Cash on Delivery in Karachi, delivery across Pakistan.`;
  return { title, description };
}

/* --------------------------- Structured data --------------------------- */
// https://schema.org — read by Google for rich results (store info, prices).

/** The shop itself: shown once, on the homepage. */
export function storeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${BASE}/#store`,
    name: SITE.name,
    description: SITE.description,
    url: BASE,
    logo: absoluteUrl("/icon.png"),
    image: absoluteUrl("/icon.png"),
    telephone: SITE.phone,
    foundingDate: String(SITE.since),
    priceRange: "Rs. 1,000 – Rs. 300,000",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.address.line1}, M.A. Jinnah Road`,
      addressLocality: "Karachi",
      addressRegion: "Sindh",
      addressCountry: "PK",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "10:30",
        closes: "20:00",
      },
    ],
    areaServed: { "@type": "Country", name: "Pakistan" },
  };
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(`/product/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.slice(0, 500),
    image: (product.images ?? []).slice(0, 5).map(absoluteUrl),
    sku: product.slug,
    brand: { "@type": "Brand", name: brandName(product.brand) },
    category: categoryBySlug(product.category)?.name,
    url,
    // No offer while the price is "coming soon": a Rs. 0 offer would be wrong.
    ...(product.price > 0
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: product.price,
            priceCurrency: "PKR",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": `${BASE}/#store` },
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
