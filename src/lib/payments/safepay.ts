import "server-only";

import { Safepay } from "@sfpy/node-sdk";
import { PaymentConfigError, type PaymentProvider, type WebhookResult } from "./provider";
import type { OrderWithItems } from "@/lib/orders";

/**
 * Safepay (Pakistan) — card, EasyPaisa and JazzCash.
 *
 * Built against the official `@sfpy/node-sdk`, so webhook signatures are
 * verified by Safepay's own implementation rather than a hand-rolled guess.
 * For reference, `verify.webhook` computes:
 *
 *   HMAC-SHA512(webhookSecret, JSON.stringify(body.data)) === headers['x-sfpy-signature']
 *
 * Note it signs the re-serialised `data` sub-object, not the raw body — so the
 * body must be parsed and handed over as an object.
 */

/**
 * Whether Safepay expects PKR in rupees or paisa.
 *
 * The SDK does not document this and its own examples are inconsistent (the
 * .NET sample passes `100.50`, the Node sample `10000`). Orders here are stored
 * as whole rupees, so we send rupees.
 *
 * VERIFY THIS ON THE FIRST SANDBOX PAYMENT: place a small order and check the
 * amount shown on Safepay's checkout page. If it is 100x out, set this to
 * `true` — it is the only line that needs to change.
 */
const AMOUNT_IN_PAISA = false;

function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new PaymentConfigError(
      "NEXT_PUBLIC_SITE_URL must be set so Safepay knows where to send customers back to.",
    );
  }
  return url.replace(/\/$/, "");
}

/*
 * The SDK types its `environment` as an internal enum that isn't re-exported
 * from the package root, so the accepted type is derived from the constructor
 * rather than deep-importing into `dist/`.
 */
type SafepayEnvironment = ConstructorParameters<
  typeof Safepay
>[0]["environment"];

function client(): Safepay {
  const apiKey = process.env.SAFEPAY_CLIENT_KEY;
  const v1Secret = process.env.SAFEPAY_SECRET_KEY;
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET;

  if (!apiKey || !v1Secret || !webhookSecret) {
    throw new PaymentConfigError(
      "Safepay is missing credentials. Set SAFEPAY_CLIENT_KEY, SAFEPAY_SECRET_KEY and SAFEPAY_WEBHOOK_SECRET.",
    );
  }

  const environment = (
    process.env.SAFEPAY_ENVIRONMENT === "production" ? "production" : "sandbox"
  ) as SafepayEnvironment;

  return new Safepay({ environment, apiKey, v1Secret, webhookSecret });
}

/**
 * The shape Safepay actually posts, confirmed against a live sandbox delivery:
 *
 *   { data: {
 *       type: "payment:created",
 *       client_id: "sec_...",
 *       notification: {
 *         tracker:  "track_<uuid>",
 *         state:    "PAID",
 *         amount:   "38400.00",
 *         currency: "PKR",
 *         metadata: { order_id: "MEC-BCMWY6", source: "custom" },
 *       },
 *   } }
 *
 * Note the outcome lives on `notification.state` — the top-level `type` is the
 * event name ("payment:created"), not the payment result.
 */
interface SafepayNotification {
  tracker?: string;
  state?: string;
  amount?: string;
  currency?: string;
  reference?: string;
  metadata?: { order_id?: string };
}

function notificationOf(data: Record<string, unknown>): SafepayNotification {
  const n = data.notification;
  return n && typeof n === "object" ? (n as SafepayNotification) : {};
}

/** Order reference, from `notification.metadata.order_id`. */
function findOrderNumber(data: Record<string, unknown>): string | null {
  const fromMetadata = notificationOf(data).metadata?.order_id;
  if (typeof fromMetadata === "string" && fromMetadata) return fromMetadata;

  // Fallback for any other event shape: the reference anywhere in the payload.
  const match = JSON.stringify(data).match(/MEC-[A-Z0-9]{6}/);
  return match ? match[0] : null;
}

/**
 * Safepay uses several spellings for a payment outcome across its products.
 *
 * `complete` (no trailing "d") is what the merchant dashboard displays, so it
 * is almost certainly what the event carries — both spellings are accepted.
 */
const PAID = new Set([
  "paid",
  "complete",
  "completed",
  "succeeded",
  "success",
  "captured",
  "tracker.succeeded",
  "payment.succeeded",
  "payment.captured",
]);
const FAILED = new Set([
  "failed",
  "failure",
  "declined",
  "cancelled",
  "canceled",
  "reversed",
  "error",
  "tracker.failed",
  "payment.failed",
]);

function readOutcome(data: Record<string, unknown>): "paid" | "failed" | null {
  const notification = notificationOf(data);

  // `notification.state` is authoritative; the rest are fallbacks for event
  // shapes we haven't seen yet.
  const candidates = [
    notification.state,
    data.state,
    data.status,
    data.event,
    data.action,
  ];

  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const normalised = value.toLowerCase();
    if (PAID.has(normalised)) return "paid";
    if (FAILED.has(normalised)) return "failed";
  }
  return null;
}

/**
 * Amount in whole PKR, for cross-checking against the order total.
 * Safepay sends it as a decimal string, e.g. "38400.00".
 */
function readAmount(data: Record<string, unknown>): number | null {
  const raw = notificationOf(data).amount;
  if (typeof raw !== "string") return null;

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

export const safepayProvider: PaymentProvider = {
  id: "safepay",
  methods: ["CARD", "EASYPAISA", "JAZZCASH"],

  isConfigured() {
    return Boolean(
      process.env.SAFEPAY_CLIENT_KEY &&
        process.env.SAFEPAY_SECRET_KEY &&
        process.env.SAFEPAY_WEBHOOK_SECRET &&
        process.env.NEXT_PUBLIC_SITE_URL,
    );
  },

  async createSession(order: OrderWithItems) {
    const safepay = client();
    const base = siteUrl();

    const { token } = await safepay.payments.create({
      amount: AMOUNT_IN_PAISA ? order.total * 100 : order.total,
      currency: "PKR",
    });

    const redirectUrl = safepay.checkout.create({
      token,
      orderId: order.orderNumber,
      // The customer lands on the confirmation page either way; the webhook is
      // what actually marks the order paid.
      redirectUrl: `${base}/checkout/confirmation/${order.orderNumber}`,
      cancelUrl: `${base}/checkout?cancelled=${order.orderNumber}`,
      webhooks: true,
    });

    return { redirectUrl, providerRef: token };
  },

  async handleWebhook(rawBody: string, headers: Headers): Promise<WebhookResult> {
    const safepay = client();

    const contentType = headers.get("content-type") ?? "";

    // Gateways ping a newly-registered endpoint to check it is alive, often
    // with an empty body. Acknowledge rather than erroring, or the endpoint
    // gets marked unhealthy and real events stop being delivered.
    if (rawBody.trim().length === 0) {
      console.info("[safepay] empty webhook body - treating as a liveness ping");
      return { orderNumber: "", outcome: "ignored" };
    }

    let body: { data?: Record<string, unknown> } | undefined;

    try {
      body = JSON.parse(rawBody);
    } catch {
      // Some providers post form-encoded, sometimes with a JSON string inside
      // a single field. Try that before giving up.
      try {
        const form = new URLSearchParams(rawBody);
        const candidate = form.get("data") ?? form.get("payload");
        if (candidate) {
          const parsed = JSON.parse(candidate);
          body = parsed?.data ? parsed : { data: parsed };
        } else if ([...form.keys()].length > 0) {
          body = { data: Object.fromEntries(form.entries()) };
        }
      } catch {
        // fall through to the diagnostic below
      }
    }

    if (!body?.data) {
      // Log enough to identify the real shape. Truncated, and the full body is
      // only printed outside production.
      console.error(
        "[safepay] could not parse webhook body.",
        JSON.stringify({
          contentType,
          bytes: rawBody.length,
          headers: Object.fromEntries(headers.entries()),
          preview:
            process.env.NODE_ENV === "production"
              ? rawBody.slice(0, 200)
              : rawBody.slice(0, 2000),
        }),
      );
      throw new PaymentConfigError(
        `Webhook body could not be parsed (content-type: ${contentType || "none"}, ${rawBody.length} bytes). See the server log for the payload.`,
      );
    }

    // The SDK expects a Node-style request shape, not a Fetch Request.
    const valid = safepay.verify.webhook({
      body,
      headers: Object.fromEntries(headers.entries()),
    });

    if (!valid) {
      // Never fall through to marking an order paid on a bad signature.
      throw new PaymentConfigError("Webhook signature verification failed.");
    }

    const orderNumber = findOrderNumber(body.data);
    const outcome = readOutcome(body.data);

    if (!orderNumber || !outcome) {
      // Signature is good, but the shape is unfamiliar. Log it so the mapping
      // above can be tightened, and take no action rather than guess.
      console.warn(
        "[safepay] verified webhook with unrecognised shape:",
        JSON.stringify(body.data).slice(0, 1000),
      );
      return { orderNumber: orderNumber ?? "", outcome: "ignored" };
    }

    return {
      orderNumber,
      outcome,
      providerRef: notificationOf(body.data).tracker,
      // Surfaced so the route can refuse to mark an order paid for the wrong
      // amount.
      amount: readAmount(body.data) ?? undefined,
    };
  },
};
