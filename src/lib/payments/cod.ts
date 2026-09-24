import "server-only";

import type { PaymentProvider } from "./provider";

/**
 * Cash on Delivery.
 *
 * No external call: the order is simply recorded and the courier collects.
 * Orders stay PENDING until someone marks them FULFILLED, which is the honest
 * state — nothing has been paid yet.
 */
export const codProvider: PaymentProvider = {
  id: "cod",
  methods: ["COD"],

  isConfigured() {
    return true;
  },

  async createSession() {
    return { redirectUrl: null };
  },

  async handleWebhook() {
    // COD has no gateway and therefore no webhooks.
    return { orderNumber: "", outcome: "ignored" as const };
  },
};
