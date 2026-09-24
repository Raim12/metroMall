import "server-only";

import { PaymentConfigError, type PaymentProvider } from "./provider";

/**
 * Safepay (Pakistan) — card / EasyPaisa / JazzCash.
 *
 * NOT YET ACTIVE. This adapter fails closed until it is finished against a real
 * merchant account, because the two things it still needs cannot be guessed
 * safely:
 *
 *   1. The hosted-checkout redirect URL format.
 *   2. The webhook signature scheme — header name and algorithm.
 *
 * Inventing (2) would be actively dangerous: a wrong implementation means
 * accepting forged "payment succeeded" callbacks and shipping goods for free.
 * So `handleWebhook` throws rather than ever returning `paid` unverified.
 *
 * What IS confirmed, from Safepay's published integration guide:
 *
 *   const safepay = require('@sfpy/node-core')(SECRET_KEY, {
 *     authType: 'secret',
 *     host: 'https://sandbox.api.getsafepay.com',  // live: https://api.getsafepay.com
 *   });
 *
 *   await safepay.payments.session.setup({
 *     merchant_api_key: API_KEY,
 *     user: '<customer token>',
 *     intent: 'CYBERSOURCE',
 *     mode: 'payment',
 *     entry_mode: 'raw',
 *     currency: 'PKR',
 *     amount: <minor units>,
 *     metadata: { order_id: order.orderNumber },
 *   });
 *
 *   await safepay.auth.passport.create();  // POST /client/passport/v1/token, 1h TTL
 *
 * To finish: install `@sfpy/node-core`, fill in the redirect + webhook details
 * from the Developers → Webhooks tab of the merchant dashboard, then set
 * PAYMENT_PROVIDER="safepay".
 *
 * Note on `amount`: confirm whether Safepay expects PKR in major or minor units
 * before going live. Orders are stored here as whole rupees.
 */

function config() {
  return {
    apiKey: process.env.SAFEPAY_API_KEY,
    secretKey: process.env.SAFEPAY_SECRET_KEY,
    host: process.env.SAFEPAY_HOST ?? "https://sandbox.api.getsafepay.com",
    webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
  };
}

export const safepayProvider: PaymentProvider = {
  id: "safepay",
  methods: ["CARD", "EASYPAISA", "JAZZCASH"],

  isConfigured() {
    const { apiKey, secretKey, webhookSecret } = config();
    return Boolean(apiKey && secretKey && webhookSecret);
  },

  async createSession() {
    throw new PaymentConfigError(
      "Safepay is not wired up yet. Set PAYMENT_PROVIDER=\"cod\", or finish src/lib/payments/safepay.ts using your merchant dashboard's integration details.",
    );
  },

  async handleWebhook() {
    // Fails closed by design — see the file header.
    throw new PaymentConfigError(
      "Safepay webhook verification is not implemented. Refusing to mark an order paid on an unverified payload.",
    );
  },
};
