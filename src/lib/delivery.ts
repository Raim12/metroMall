/**
 * Delivery and payment rules, shared by the checkout form (to show them), the
 * checkout API (to enforce them), the confirmation page and the policies, so
 * they can never disagree.
 *
 *  - Every order carries a flat delivery charge (DELIVERY_CHARGE).
 *  - Cash on Delivery (Karachi only): the customer transfers the delivery
 *    charge in advance and pays for the goods on delivery.
 *  - Bank Transfer (anywhere): the customer transfers the full amount,
 *    delivery included, in advance.
 *  - Either way the customer WhatsApps the payment receipt; the team confirms
 *    the order, dispatches it, and updates its status in the admin panel.
 */

export const COD_CITY = "Karachi";

/** Flat delivery charge on every website order (whole PKR). */
export const DELIVERY_CHARGE = 300;

/** Where customers send advance payments. */
export const BANK_ACCOUNT = {
  bank: "MCB Bank Limited",
  iban: "PK10MUCB0003301010064245",
  title: "Metro Electric Co",
} as const;

export const RECEIPT_NOTE =
  "Once you send the payment, WhatsApp us the receipt. We'll then confirm your order and dispatch it.";

/** "karachi", " Karachi ", "KHI", "Karachi, Sindh" all count. */
export function isKarachi(city: string | null | undefined): boolean {
  const c = (city ?? "").trim().toLowerCase();
  return c.startsWith("karachi") || c === "khi";
}

/** Which of the offered payment methods a customer in `city` may use. */
export function paymentMethodsFor(city: string, offered: string[]): string[] {
  if (isKarachi(city)) return offered;
  return offered.filter((m) => m === "BANK_TRANSFER");
}

/** How much the customer must transfer in advance for a given method. */
export function advanceAmount(method: string, total: number): number {
  return method === "COD" ? DELIVERY_CHARGE : total;
}

/** One-line explanation of the advance payment, for a given method. */
export function advanceInstruction(method: string): string {
  return method === "COD"
    ? `Transfer the Rs. ${DELIVERY_CHARGE} delivery charge in advance; pay for your order in cash when it arrives.`
    : `Transfer the full amount, including the Rs. ${DELIVERY_CHARGE} delivery charge, in advance.`;
}
