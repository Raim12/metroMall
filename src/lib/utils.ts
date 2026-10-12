import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** `12600` -> `Rs. 12,600` */
export function formatPkr(amount: number): string {
  return `Rs. ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

/**
 * Placeholder size/colour for products that come in one variant. Cart lines and
 * orders always carry a size and colour, so single-variant products store this
 * value and the UI hides the picker instead.
 */
export const STANDARD_VARIANT = "Standard";

/** True when there is a real choice to show (more than the placeholder). */
export function hasChoice(values: string[]): boolean {
  return values.length > 1 || (values.length === 1 && values[0] !== STANDARD_VARIANT);
}

/** "56\" · Brown" — leaving out placeholder values; "" when neither is real. */
export function variantLabel(size: string, colorName: string): string {
  return [size, colorName].filter((v) => v && v !== STANDARD_VARIANT).join(" · ");
}

/**
 * A live product without a price yet (e.g. a newly announced range). It is
 * shown in the shop with "Price coming soon" but can't be added to the cart;
 * the checkout refuses it too. Setting a price in the admin is all it takes
 * to make it orderable.
 */
export function isPriceComingSoon(product: { price: number }): boolean {
  return product.price <= 0;
}
