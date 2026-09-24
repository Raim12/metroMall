"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FanIllustration } from "@/components/product/fan-illustration";
import { useCartStore } from "@/store/cart-store";
import { formatPkr, cn } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Memoised: the catalogue re-renders this list on every search keystroke and
 * filter change, and each card carries a non-trivial inline SVG.
 */
export const ProductCard = React.memo(function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const [colorIndex, setColorIndex] = React.useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const color = product.colors[colorIndex];

  const handleAdd = () => {
    addItem(product, { size: product.sizes[0], color });
    toast.success(`${product.name} added to cart`, {
      description: `${product.sizes[0]} Â· ${color.name}`,
    });
  };

  return (
    <Card
      className={cn(
        "group flex h-full flex-col gap-0 overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink-950/10",
        className,
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className="metro-tile relative block aspect-[4/3] overflow-hidden p-6"
      >
        {product.badge ? (
          <Badge className="absolute left-3 top-3 z-10 bg-brand-600 text-white hover:bg-brand-600">
            {product.badge}
          </Badge>
        ) : null}

        {/* CSS hover instead of Framer Motion â€” keeps the whole catalogue
            route free of the animation runtime. */}
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.06] group-hover:rotate-2 motion-reduce:transform-none">
          <FanIllustration
            variant={product.illustration}
            color={color.hex}
            trim={color.trim}
            title={`${product.name} in ${color.name}`}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-heading text-base font-bold leading-tight transition-colors group-hover:text-brand-700">
              {product.name}
            </h3>
          </Link>

          {/* Colourway swatches â€” these drive the illustration above. */}
          <div className="flex shrink-0 items-center gap-1 pt-0.5">
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColorIndex(i)}
                aria-label={`Show ${c.name}`}
                aria-pressed={i === colorIndex}
                title={c.name}
                className={cn(
                  "size-4 rounded-full border transition-all",
                  i === colorIndex
                    ? "ring-2 ring-brand-500 ring-offset-1"
                    : "border-black/15 hover:scale-110",
                )}
                style={{
                  background: `linear-gradient(135deg, ${c.hex} 55%, ${c.trim} 55%)`,
                }}
              />
            ))}
          </div>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Available in{" "}
          <span className="font-semibold text-brand-600">
            {product.sizes.join(", ")}
          </span>
        </p>

        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-cta-400 text-cta-400" aria-hidden />
          <span className="font-semibold text-foreground">{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {product.compareAtPrice ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatPkr(product.compareAtPrice)}
              </p>
            ) : null}
            <p className="font-heading text-lg font-extrabold text-brand-700">
              {formatPkr(product.price)}
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleAdd}
            className="bg-cta-400 font-semibold text-cta-foreground hover:bg-cta-500"
          >
            <ShoppingCart className="size-4" aria-hidden />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
});
