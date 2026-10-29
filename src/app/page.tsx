import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/json-ld";
import { storeJsonLd } from "@/lib/seo";
import { HeroSlider } from "@/components/home/hero-slider";
import { HomeSearch } from "@/components/home/home-search";
import { ValueProposition } from "@/components/home/value-proposition";
import { TechShowcase } from "@/components/home/tech-showcase";
import { ProductCategories } from "@/components/home/product-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { ProductShowcase } from "@/components/home/product-showcase";
import { BrandStrip } from "@/components/home/brand-strip";
import { TrustShowcase } from "@/components/home/trust-showcase";
import { HouseBrands } from "@/components/home/house-brands";
import { BldcHighlight } from "@/components/home/bldc-highlight";
import { FaqSection } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";
import {
  getCatalogueFacets,
  getCategoryCovers,
  getFeaturedProducts,
} from "@/lib/products";

export const revalidate = 300;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [featured, covers, facets] = await Promise.all([
    getFeaturedProducts(),
    getCategoryCovers(),
    getCatalogueFacets(),
  ]);
  // The showcase talks about inverter fans, so prefer a featured one — falling
  // back to AC/DC, which is the other energy-saving motor type.
  const showcase =
    featured.find((p) => p.category === "ceiling-fans-inverter") ??
    featured.find((p) => p.category === "ceiling-fans-acdc") ??
    featured[0];

  return (
    <>
      <JsonLd data={storeJsonLd()} />
      <HomeSearch />
      {featured.length ? (
        <HeroSlider products={featured} brandCounts={facets.brands} />
      ) : null}
      <HouseBrands />
      {showcase ? <TechShowcase product={showcase} /> : null}
      <ValueProposition />
      <ProductCategories covers={covers} counts={facets.categories} />
      <FeaturedProducts products={featured} />
      <ProductShowcase />
      <BrandStrip counts={facets.brands} />
      <TrustShowcase />
      <BldcHighlight />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
