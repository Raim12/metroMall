import "server-only";

import { codProvider } from "./cod";
import { bankTransferProvider } from "./bank-transfer";
import { safepayProvider } from "./safepay";
import { PaymentConfigError, type PaymentProvider } from "./provider";

export { PaymentConfigError };
export type { PaymentProvider, CheckoutSession, WebhookResult } from "./provider";

const PROVIDERS: PaymentProvider[] = [codProvider, safepayProvider];

/** The gateway configured for non-COD methods, if any. */
export function activeGateway(): PaymentProvider | null {
  const id = process.env.PAYMENT_PROVIDER ?? "cod";
  if (id === "cod") return null;

  const provider = PROVIDERS.find((p) => p.id === id);
  if (!provider) {
    throw new PaymentConfigError(`Unknown PAYMENT_PROVIDER "${id}".`);
  }
  return provider;
}

/** Resolves the provider that should settle a given payment method. */
export function providerForMethod(method: string): PaymentProvider {
  if (method === "COD") return codProvider;
  if (method === "BANK_TRANSFER") return bankTransferProvider;

  const gateway = activeGateway();
  if (!gateway || !gateway.methods.includes(method)) {
    throw new PaymentConfigError(
      `No payment gateway is configured for ${method}. Only Cash on Delivery is available right now.`,
    );
  }
  if (!gateway.isConfigured()) {
    throw new PaymentConfigError(
      `${gateway.id} is selected but missing credentials — check your environment variables.`,
    );
  }
  return gateway;
}

/**
 * Online card/wallet payments are paused for now: customers pay by Cash on
 * Delivery or bank transfer and WhatsApp the receipt (lib/delivery.ts). Set to
 * true to offer the configured gateway's methods again — no other change needed.
 */
const ONLINE_PAYMENTS_ENABLED = false;

/** Methods the storefront should actually offer, given current config. */
export function availablePaymentMethods(): string[] {
  const methods = ["COD", "BANK_TRANSFER"];
  const gateway = activeGateway();
  if (ONLINE_PAYMENTS_ENABLED && gateway?.isConfigured()) methods.push(...gateway.methods);
  return methods;
}
