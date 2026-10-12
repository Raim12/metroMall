import { DELIVERY_CHARGE } from "@/lib/delivery";

/**
 * Delivery charge added to every website order (see lib/delivery.ts). Kept
 * free of server-only imports so client components can share it. The admin can
 * still change it per order from the admin panel.
 */
export function calculateShipping(): number {
  return DELIVERY_CHARGE;
}
