import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StockControl } from "@/components/admin/stock-control";
import { FanIllustration } from "@/components/product/fan-illustration";
import { listAdminProducts } from "@/lib/admin/queries";
import { formatPkr } from "@/lib/utils";
import type { FanVariant } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await listAdminProducts(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"}. Edit
            stock inline; click a product for full details and photos.
          </p>
        </div>
        <Button asChild className="bg-brand-600 hover:bg-brand-700">
          <Link href="/admin/products/new">
            <Plus className="size-4" aria-hidden />
            Add product
          </Link>
        </Button>
      </div>

      <form action="/admin/products" className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or slug"
          aria-label="Search products"
          className="bg-white pl-9"
        />
      </form>

      <Card className="gap-0 p-0">
        {products.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">
            No products match that search.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const color = p.colors[0];
                  const photo = p.images[0];
                  const low = p.trackStock && p.stock <= p.lowStockThreshold;

                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="metro-tile grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg p-1">
                            {photo ? (
                              <Image
                                src={photo}
                                alt=""
                                width={48}
                                height={48}
                                className="size-full rounded object-cover"
                              />
                            ) : (
                              <FanIllustration
                                variant={p.illustration as FanVariant}
                                color={color?.hex ?? "#1f2224"}
                                trim={color?.trim ?? "#c9a227"}
                                title={p.name}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-medium hover:text-brand-700"
                            >
                              {p.name}
                            </Link>
                            <p className="font-mono text-xs text-muted-foreground">
                              {p.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold tabular-nums">
                        {formatPkr(p.price)}
                      </td>
                      <td className="px-5 py-3">
                        {p.trackStock ? (
                          <StockControl productId={p.id} stock={p.stock} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not tracked
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {!p.active ? (
                            <Badge variant="secondary">Hidden</Badge>
                          ) : null}
                          {p.featured ? (
                            <Badge className="border-transparent bg-brand-100 text-brand-800 hover:bg-brand-100">
                              Featured
                            </Badge>
                          ) : null}
                          {low ? (
                            <Badge
                              variant={p.stock <= 0 ? "destructive" : "secondary"}
                            >
                              {p.stock <= 0 ? "Out of stock" : "Low"}
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-sm font-medium text-brand-700 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
