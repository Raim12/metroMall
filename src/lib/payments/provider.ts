import "server-only";

import type { OrderWithItems } from "@/lib/orders";

/**
 * Payment provider abstraction.
 *
 * COD is fully implemented. A gateway (Safepay/PayFast) plugs in by
 * implementing this interface and registering itself in `index.ts` — the
 * checkout route never learns which provider it is talking to.
 */

export interface CheckoutSession {
  /** Where to send the customer next. `null` means nothing more is required. */
  redirectUrl: string | null;
  /** Gateway-side reference stored on the order for reconciliation. */
  providerRef?: string;
}

export interface WebhookResult {
  /** Order number the event refers to. */
  orderNumber: string;
  outcome: "paid" | "failed" | "ignored";
  providerRef?: string;
  /**
   * Amount the gateway says was settled, in whole PKR. When present, the route
   * refuses to mark an order paid unless it matches the order total.
   */
  amount?: number;
}

export interface PaymentProvider {
  readonly id: string;
  /** Payment methods this provider can settle. */
  readonly methods: readonly string[];
  /** Whether the provider has the configuration it needs to run. */
  isConfigured(): boolean;
  /** Called after the order row exists but before the customer is redirected. */
  createSession(order: OrderWithItems): Promise<CheckoutSession>;
  /**
   * Verifies and interprets a webhook. MUST reject anything it cannot
   * cryptographically verify — returning `ignored` is always safer than
   * marking an order paid on an unverified payload.
   */
  handleWebhook(
    rawBody: string,
    headers: Headers,
  ): Promise<WebhookResult>;
}

export class PaymentConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentConfigError";
  }
}
