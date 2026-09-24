/**
 * Shared domain types.
 *
 * Phase 1 sources products from `src/lib/products.ts`. These shapes are kept
 * deliberately close to the intended Prisma models so Phase 2 can swap the
 * static array for a database query without touching the UI.
 */

export type FanVariant =
  | "ceiling-3"
  | "ceiling-5"
  | "ceiling-8"
  | "pedestal"
  | "exhaust"
  | "false-ceiling"
  | "bracket"
  | "socket-light";

export type CategorySlug =
  | "ceiling-fans"
  | "pedestal-fans"
  | "exhaust-fans"
  | "false-ceiling-fans"
  | "bracket-fans";

export interface ProductColor {
  /** Human readable name shown in the Select + tooltip. */
  name: string;
  /** Body colour of the fan, also drives the illustration. */
  hex: string;
  /** Secondary trim colour (ring / accent on the blades). */
  trim: string;
}

export interface SpecRow {
  speed: number;
  watts: number;
  rpm: number;
}

export interface ProductFeature {
  /** Lucide icon name, resolved in `feature-icon.tsx`. */
  icon: "wind" | "camera" | "play" | "shield" | "zap" | "battery";
  title: string;
  body: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Short marketing line used on catalogue cards. */
  tagline: string;
  description: string;
  price: number;
  /** Optional strike-through price, in PKR. */
  compareAtPrice?: number;
  category: CategorySlug;
  /** e.g. ['56"', '48"'] */
  sizes: string[];
  colors: ProductColor[];
  illustration: FanVariant;
  /**
   * Real photography, when available. Falls back to the generated
   * illustration so Phase 1 renders without any binary assets.
   */
  images?: string[];
  badge?: string;
  rating: number;
  reviewCount: number;
  features: ProductFeature[];
  specs: SpecRow[];
  inTheBox: string[];
  featured?: boolean;
}

export interface CartItem {
  /** `${productId}:${size}:${colorName}` — one line per variant. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  color: ProductColor;
  illustration: FanVariant;
  image?: string;
  quantity: number;
}
