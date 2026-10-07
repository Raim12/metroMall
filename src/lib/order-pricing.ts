/**
 * Delivery pricing. Kept free of server-only imports so client components
 * (the admin order form) can show the same numbers checkout charges.
 */

/** Free delivery at or above this order value (whole PKR). */
export const FREE_SHIPPING_THRESHOLD = 20000;
/** Flat delivery charge below the threshold (whole PKR). */
export const FLAT_SHIPPING_FEE = 350;

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}
