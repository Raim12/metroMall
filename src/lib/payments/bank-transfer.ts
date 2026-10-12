import "server-only";

import type { PaymentProvider } from "./provider";

/**
 * Bank Transfer — the only option outside Karachi (see lib/delivery.ts).
 *
 * Like COD there is no gateway: the order is recorded as PENDING, the team
 * WhatsApps the customer the account details, and the owner marks it PAID in
 * the admin once the transfer arrives.
 */
export const bankTransferProvider: PaymentProvider = {
  id: "bank-transfer",
  methods: ["BANK_TRANSFER"],

  isConfigured() {
    return true;
  },

  async createSession() {
    return { redirectUrl: null };
  },

  async handleWebhook() {
    return { orderNumber: "", outcome: "ignored" as const };
  },
};
