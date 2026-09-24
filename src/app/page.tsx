import { HeroSlider } from "@/components/home/hero-slider";
import { ValueProposition } from "@/components/home/value-proposition";
import { TechShowcase } from "@/components/home/tech-showcase";
import { ProductCategories } from "@/components/home/product-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { BldcHighlight } from "@/components/home/bldc-highlight";
import { FaqSection } from "@/components/home/faq-section";
import { CtaBanner } from "@/components/home/cta-banner";
import { Certifications } from "@/components/home/certifications";
import { getFeaturedProducts, getProductBySlug } from "@/lib/products";

export const revalidate = 300;

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const showcase = (await getProductBySlug("metro-astro-inverter")) ?? featured[0];

  return (
    <>
      <HeroSlider products={featured} />
      <TechShowcase product={showcase} />
      <ValueProposition />
      <ProductCategories />
      <FeaturedProducts products={featured} />
      <BldcHighlight />
      <FaqSection />
      <CtaBanner />
      <Certifications />
    </>
  );
}
