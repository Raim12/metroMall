import { deliveryChargeFor } from "@/lib/delivery";

/**
 * Delivery charge for a website order (see lib/delivery.ts): the flat charge in
 * Karachi, nothing elsewhere because the customer pays bilty to the cargo company. Kept
 * free of server-only imports so client components can share it. The admin can
 * still change it per order from the admin panel.
 */
export function calculateShipping(city: string): number {
  return deliveryChargeFor(city);
}
