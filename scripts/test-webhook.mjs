/**
 * Sends a correctly-signed Safepay webhook to your local server.
 *
 * Lets you verify the whole payment-confirmation path without a tunnel and
 * without Safepay being able to reach you:
 *
 *   npm run test:webhook -- MEC-7QK2XB          # mark paid
 *   npm run test:webhook -- MEC-7QK2XB failed   # mark failed
 *
 * The signature is computed exactly as @sfpy/node-sdk verifies it:
 *   HMAC-SHA512(SAFEPAY_WEBHOOK_SECRET, JSON.stringify(body.data))
 * sent in the `x-sfpy-signature` header.
 */
import "dotenv/config";
import crypto from "node:crypto";

const orderNumber = process.argv[2];
const outcome = (process.argv[3] ?? "paid").toLowerCase();

if (!orderNumber) {
  console.error(
    "\nUsage: npm run test:webhook -- <ORDER_NUMBER> [paid|failed]\n\n" +
      "Place an order with a card/EasyPaisa/JazzCash method first, then pass\n" +
      "its order number (looks like MEC-7QK2XB).\n",
  );
  process.exit(1);
}

const secret = process.env.SAFEPAY_WEBHOOK_SECRET;

if (!secret) {
  console.error(
    "\nSAFEPAY_WEBHOOK_SECRET is not set in .env.\n" +
      "Get it from the Safepay dashboard: Developers > Webhooks.\n",
  );
  process.exit(1);
}

const base = process.env.WEBHOOK_TARGET ?? "http://localhost:3000";

const body = {
  data: {
    tracker: `track_${crypto.randomBytes(6).toString("hex")}`,
    state: outcome === "failed" ? "FAILED" : "PAID",
    order_id: orderNumber,
    currency: "PKR",
  },
};

// Must match the SDK byte-for-byte: it signs the re-serialised `data` object.
const signature = crypto
  .createHmac("sha512", secret)
  .update(Buffer.from(JSON.stringify(body.data)))
  .digest("hex");

console.log(`\nPOST ${base}/api/webhooks/payment`);
console.log(`  order:   ${orderNumber}`);
console.log(`  outcome: ${body.data.state}\n`);

const response = await fetch(`${base}/api/webhooks/payment`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-sfpy-signature": signature,
  },
  body: JSON.stringify(body),
});

const text = await response.text();
console.log(`  ${response.status} ${text}\n`);

if (response.ok) {
  console.log(`Check the order at: ${base}/admin/orders\n`);
} else {
  console.log(
    "If this is 404, PAYMENT_PROVIDER is still \"cod\" — set it to \"safepay\".\n",
  );
}
