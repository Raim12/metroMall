import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { ImageManager } from "@/components/admin/image-manager";
import { ProductVisibilityToggle } from "@/components/admin/product-visibility-toggle";
import { getAdminProduct } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProduct(id);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to products
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">
            {product.name}
          </h1>
          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-700"
          >
            View in shop
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </div>

        <ProductVisibilityToggle id={product.id} active={product.active} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <ProductForm
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            tagline: product.tagline,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            category: product.category,
            sizes: product.sizes,
            illustration: product.illustration,
            stock: product.stock,
            lowStockThreshold: product.lowStockThreshold,
            trackStock: product.trackStock,
            featured: product.featured,
            active: product.active,
            badge: product.badge,
            inTheBox: product.inTheBox,
          }}
        />

        <div className="space-y-6">
          <ImageManager productId={product.id} images={product.images} />

          <div className="rounded-xl border bg-white p-5 text-sm">
            <h2 className="font-heading text-base font-bold">Colourways</h2>
            <ul className="mt-3 space-y-2">
              {product.colors.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5">
                  <span
                    className="size-5 shrink-0 rounded-full border"
                    style={{
                      background: `linear-gradient(135deg, ${c.hex} 55%, ${c.trim} 55%)`,
                    }}
                  />
                  <span className="text-sm">{c.name}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Colourways, feature blocks and the speed/watt table are seeded from
              <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono">
                prisma/seed-data.ts
              </code>
              . Editing them here is not built yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
