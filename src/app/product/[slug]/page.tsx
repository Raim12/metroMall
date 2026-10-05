import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ProductDetail } from "@/components/product/product-detail";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductCard } from "@/components/product/product-card";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import {
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { brandName, categoryBySlug } from "@/lib/constants";
import { formatPkr } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

// Featured products are prerendered at build time; the rest of the 1,000+
// catalogue renders on first visit and is then cached. Both refresh in the
// background every 5 minutes, so catalogue edits go live without a redeploy.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const featured = await getFeaturedProducts();
  return featured.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: `${product.name} — ${brandName(product.brand)}`,
    description: `${product.tagline} — ${formatPkr(product.price)}. ${product.description.slice(0, 120)}…`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(slug, 4);

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-brand-700">
                Home
              </Link>
            </li>
            <ChevronRight className="size-3" aria-hidden />
            <li>
              <Link href="/catalogue" className="hover:text-brand-700">
                Products
              </Link>
            </li>
            <ChevronRight className="size-3" aria-hidden />
            <li>
              <Link href={`/catalogue?category=${product.category}`} className="hover:text-brand-700">
                {categoryBySlug(product.category)?.name ?? "Category"}
              </Link>
            </li>
            <ChevronRight className="size-3" aria-hidden />
            <li className="font-medium text-foreground">{product.name}</li>
          </ol>
        </nav>

        <ProductDetail product={product} />

        <div className="mt-16">
          <ProductTabs product={product} />
        </div>
      </div>

      {/* Related */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-extrabold sm:text-3xl">
            You Might Also Like
          </h2>

          <RevealGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <RevealItem key={item.id} className="h-full">
                <ProductCard product={item} className="h-full" />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
