import Image from "next/image";

import { FanIllustration } from "@/components/product/fan-illustration";
import { cn } from "@/lib/utils";
import type { FanVariant } from "@/types";

/**
 * A product's picture: its photo when it has one, otherwise the generated fan
 * illustration. Every storefront surface (cards, gallery, cart, orders) goes
 * through this so the fallback rule lives in one place.
 *
 * Photos are served by `/api/uploads/...` and optimised by next/image, which
 * resizes to the `sizes` hint — a 1200px original never ships to a 64px cart
 * thumbnail.
 */
export function ProductImage({
  src,
  alt,
  illustration,
  color = "#f5f5f4",
  trim = "#a8a29e",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  priority = false,
  spin = false,
  className,
}: {
  src?: string | null;
  alt: string;
  illustration: FanVariant | string;
  color?: string;
  trim?: string;
  sizes?: string;
  priority?: boolean;
  spin?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full", className)}>
      <FanIllustration
        variant={illustration as FanVariant}
        color={color}
        trim={trim}
        spin={spin}
        title={alt}
      />
    </div>
  );
}
