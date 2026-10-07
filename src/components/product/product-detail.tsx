"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Star, Check, ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage } from "@/components/product/product-image";
import { useCartStore } from "@/store/cart-store";
import { brandName } from "@/lib/constants";
import { formatPkr, cn, hasChoice } from "@/lib/utils";
import type { Product } from "@/types";

const TRUST = [
  { icon: BadgeCheck, label: "100% Genuine Brand Product" },
  { icon: ShieldCheck, label: "Official Brand Warranty" },
  { icon: Truck, label: "Delivery Across Pakistan" },
];

export function ProductDetail({ product }: { product: Product }) {
  const [colorIndex, setColorIndex] = React.useState(0);
  const [imageIndex, setImageIndex] = React.useState(0);
  const [size, setSize] = React.useState<string>(product.sizes[0]);
  const [quantity, setQuantity] = React.useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const color = product.colors[colorIndex];
  const images = product.images ?? [];
  const showColors = hasChoice(product.colors.map((c) => c.name));
  const showSizes = hasChoice(product.sizes);
  const brand = brandName(product.brand);

  const handleAdd = () => {
    addItem(product, { size, color, quantity });
    toast.success(`${product.name} added to cart`, {
      description: [`${quantity} ×`, showSizes && size, showColors && color.name]
        .filter(Boolean)
        .join(" "),
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* ---------------------------- Gallery ---------------------------- */}
      <div>
        <div className="metro-tile relative aspect-square overflow-hidden rounded-2xl border p-6 shadow-sm sm:p-10">
          {product.badge ? (
            <Badge className="absolute left-4 top-4 z-10 bg-brand-600 text-white hover:bg-brand-600">
              {product.badge}
            </Badge>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={images.length ? `img-${imageIndex}` : `color-${color.name}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <ProductImage
                src={images[imageIndex]}
                alt={`${product.name}${images.length > 1 ? ` — photo ${imageIndex + 1}` : ""}`}
                illustration={product.illustration}
                color={color.hex}
                trim={color.trim}
                sizes="(min-width: 1024px) 45vw, 100vw"
                priority
                spin
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnails — one per photo, or one per colourway for illustrations */}
        {images.length > 1 ? (
          <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={`View photo ${i + 1}`}
                aria-current={i === imageIndex}
                className={cn(
                  "metro-tile size-20 shrink-0 overflow-hidden rounded-xl border p-1.5 transition-all",
                  i === imageIndex
                    ? "border-brand-500 ring-2 ring-brand-500/30"
                    : "hover:border-brand-300",
                )}
              >
                <ProductImage
                  src={src}
                  alt=""
                  illustration={product.illustration}
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        ) : !images.length && showColors ? (
          <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColorIndex(i)}
                aria-label={`View ${c.name}`}
                aria-current={i === colorIndex}
                className={cn(
                  "metro-tile size-20 shrink-0 rounded-xl border p-1.5 transition-all",
                  i === colorIndex
                    ? "border-brand-500 ring-2 ring-brand-500/30"
                    : "hover:border-brand-300",
                )}
              >
                <ProductImage
                  alt={c.name}
                  illustration={product.illustration}
                  color={c.hex}
                  trim={c.trim}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* --------------------------- Purchase ---------------------------- */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/catalogue?brand=${product.brand}`}
            className="text-sm font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700"
          >
            {brand}
          </Link>
          {product.badge ? (
            <Badge className="bg-brand-100 text-brand-800 hover:bg-brand-100">
              {product.badge}
            </Badge>
          ) : null}
          {product.reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="flex" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-4",
                      i < Math.round(product.rating)
                        ? "fill-cta-400 text-cta-400"
                        : "text-muted-foreground/30",
                    )}
                  />
                ))}
              </span>
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>
          ) : null}
        </div>

        <h1 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl">
          {product.name}
          {showSizes && product.sizes.length > 1 ? ` ${size}` : ""}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>

        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <span className="font-heading text-3xl font-extrabold text-brand-700">
            {formatPkr(product.price)}
          </span>
          {product.compareAtPrice ? (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPkr(product.compareAtPrice)}
              </span>
              <Badge className="bg-leaf-500 text-white hover:bg-leaf-500">
                Save {formatPkr(product.compareAtPrice - product.price)}
              </Badge>
            </>
          ) : null}
        </div>

        <div className="mt-6 space-y-4">
          {/* Quantity */}
          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <div className="flex w-fit items-center rounded-lg border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="grid size-9 place-items-center rounded-l-lg transition-colors hover:bg-muted"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <span className="w-12 text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
                className="grid size-9 place-items-center rounded-r-lg transition-colors hover:bg-muted"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          {showColors ? (
            <div className="space-y-1.5">
              <Label htmlFor="color-select">Colour</Label>
              <Select
                value={color.name}
                onValueChange={(name) =>
                  setColorIndex(product.colors.findIndex((c) => c.name === name))
                }
              >
                <SelectTrigger id="color-select" className="w-full">
                  <SelectValue placeholder="Select colour" />
                </SelectTrigger>
                <SelectContent>
                  {product.colors.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-3.5 rounded-full border border-black/15"
                          style={{
                            background: `linear-gradient(135deg, ${c.hex} 55%, ${c.trim} 55%)`,
                          }}
                        />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {showSizes ? (
            <div className="space-y-1.5">
              <Label htmlFor="size-select">Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger id="size-select" className="w-full">
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <Button
            size="lg"
            onClick={handleAdd}
            className="w-full bg-cta-400 text-base font-bold text-cta-foreground shadow-lg shadow-cta-600/20 hover:bg-cta-500"
          >
            <ShoppingCart className="size-5" aria-hidden />
            Add to Cart — {formatPkr(product.price * quantity)}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Check className="size-3.5 text-leaf-600" aria-hidden />
            Cash on Delivery available nationwide
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-5">
          {TRUST.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              <Icon className="size-4 text-brand-600" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
