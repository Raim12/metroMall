/**
 * Delivery and payment rules, shared by the checkout form (to show them), the
 * checkout API (to enforce them), the confirmation page and the policies, so
 * they can never disagree.
 *
 *  - Karachi orders carry a delivery charge that depends on the area. The
 *    website does not quote it: the team agrees it with the customer on
 *    WhatsApp before dispatch (DELIVERY_QUOTE_NOTE).
 *  - Outside Karachi, orders go by cargo. The website charges no delivery:
 *    the customer pays the bilty (cargo) charges to the cargo company.
 *  - Cash on Delivery (Karachi only): the customer pays for the goods on
 *    delivery; the delivery charge is settled as agreed on WhatsApp.
 *  - Bank Transfer (anywhere): the customer transfers the order amount in
 *    advance; delivery is added separately once agreed.
 *  - Either way the customer WhatsApps the payment receipt; the team confirms
 *    the order, dispatches it, and updates its status in the admin panel.
 *
 * A flat charge used to be quoted here. It was withdrawn because Karachi is
 * too spread out for one number to be honest: the same fan costs very
 * different amounts to deliver to Saddar and to Gadap.
 */

export const COD_CITY = "Karachi";

/**
 * What the customer is told in place of a price. Used anywhere the old flat
 * charge was printed, so the checkout, the cart, the policies and the emails
 * all say the same thing.
 */
export const DELIVERY_QUOTE_NOTE =
  "Delivery charges inside Karachi depend on your area. We'll confirm the exact charge with you on WhatsApp before dispatch.";

/** Shown wherever an order outside Karachi is priced. */
export const BILTY_NOTE =
  "Outside Karachi, orders are sent by cargo. Bilty (cargo) charges are not included and are paid by you to the cargo company.";

/**
 * Maximum dispatch-to-delivery window quoted to customers, in working days.
 * Most orders arrive sooner; this is the outer limit we commit to.
 */
export const MAX_DELIVERY_WORKING_DAYS = 7;

/**
 * Above this many units an order no longer fits the flat charge: one fan goes
 * by bike, twenty go by Shehzore. Rather than invent a rate, the checkout
 * stops quoting a delivery price and asks the customer to agree it on
 * WhatsApp, which is how bulk orders are handled anyway.
 */
export const BULK_DELIVERY_THRESHOLD = 5;

/** Whether this basket needs a quoted delivery charge rather than the flat one. */
export function needsDeliveryQuote(totalUnits: number): boolean {
  return totalUnits > BULK_DELIVERY_THRESHOLD;
}

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

/**
 * Delivery charged on a website order: nothing, anywhere.
 *
 * In Karachi the charge is agreed by area on WhatsApp and recorded on the
 * order by the admin; outside Karachi the customer pays bilty direct to the
 * cargo company. Either way the website is not the place it gets priced.
 */
export function deliveryChargeFor(city: string | null | undefined): number {
  // `city` is kept in the signature because callers pass one and the rule may
  // well become city-dependent again; nothing reads it today.
  void city;
  return 0;
}

/**
 * How much the customer must transfer in advance.
 *
 * `shipping` is the delivery charge recorded on the order, which is zero for a
 * fresh website order and whatever the admin agreed for a confirmed one. It is
 * passed in rather than read from a constant so that orders placed under the
 * old flat charge still show the amount that was actually asked for.
 */
export function advanceAmount(method: string, total: number, shipping = 0): number {
  return method === "COD" ? shipping : total;
}

/** One-line explanation of the advance payment, for a given method. */
export function advanceInstruction(method: string, city?: string | null): string {
  if (method === "COD") {
    return `Pay for your order in cash when it arrives. ${DELIVERY_QUOTE_NOTE}`;
  }
  return isKarachi(city)
    ? `Transfer the order amount in advance. ${DELIVERY_QUOTE_NOTE}`
    : "Transfer the full order amount in advance. Bilty (cargo) charges are paid by you to the cargo company.";
}
