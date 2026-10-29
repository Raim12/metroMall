import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validation";
import { CheckoutError, createOrder, priceCart } from "@/lib/orders";
import { PaymentConfigError, availablePaymentMethods, providerForMethod } from "@/lib/payments";
import { sendInternalOrderAlert, sendOrderConfirmation } from "@/lib/email";
import { BULK_DELIVERY_THRESHOLD, COD_CITY, isKarachi, needsDeliveryQuote } from "@/lib/delivery";

/**
 * POST /api/checkout
 *
 * Validates the request, re-prices the cart from the database, records the
 * order, then hands off to the payment provider. For COD the order is complete
 * at that point; for a gateway the response carries a redirect URL.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const input = parsed.data;

  // Only the methods the storefront currently offers (online payments are paused).
  if (!availablePaymentMethods().includes(input.paymentMethod)) {
    return NextResponse.json(
      { error: "Please choose Cash on Delivery or Bank Transfer." },
      { status: 422 },
    );
  }

  // Outside Karachi only bank transfer is accepted (lib/delivery.ts). The form
  // already hides the other options; this stops a crafted request.
  if (!isKarachi(input.city) && input.paymentMethod !== "BANK_TRANSFER") {
    return NextResponse.json(
      {
        error: `Outside ${COD_CITY} we accept bank transfer only. Please choose Bank Transfer.`,
        issues: { paymentMethod: ["Bank transfer only outside Karachi"] },
      },
      { status: 422 },
    );
  }

  /*
   * Bulk orders are not priced automatically. One fan goes on a bike, twenty
   * need a Shehzore, and the flat charge would be wrong by a wide margin.
   * Above the threshold the customer agrees delivery with us on WhatsApp.
   */
  const totalUnits = input.items.reduce((n, i) => n + i.quantity, 0);
  if (needsDeliveryQuote(totalUnits)) {
    return NextResponse.json(
      {
        error: `Orders over ${BULK_DELIVERY_THRESHOLD} items need a delivery quote. Please send us the list on WhatsApp and we will confirm the delivery charge with you.`,
        issues: { items: ["Bulk order — delivery quoted separately"] },
      },
      { status: 422 },
    );
  }

  try {
    // Resolve the provider before writing anything, so an unconfigured gateway
    // doesn't leave an orphaned order behind.
    const provider = providerForMethod(input.paymentMethod);

    const cart = await priceCart(input.items, input.city);
    const order = await createOrder(input, cart);

    let redirectUrl: string | null = null;
    try {
      const session = await provider.createSession(order);
      redirectUrl = session.redirectUrl;

      if (session.providerRef) {
        await prisma.order.update({
          where: { id: order.id },
          data: { providerRef: session.providerRef },
        });
      }
    } catch (error) {
      // The order exists but the gateway handoff failed. Mark it so it doesn't
      // sit in PENDING forever looking like a live order.
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });
      throw error;
    }

    // Email must never fail a committed order.
    await Promise.allSettled([
      sendOrderConfirmation(order),
      sendInternalOrderAlert(order),
    ]);

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        shipping: order.shipping,
        paymentMethod: order.paymentMethod,
        redirectUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status },
      );
    }
    if (error instanceof PaymentConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("[api/checkout]", error);
    return NextResponse.json(
      { error: "Could not place your order. Please try again." },
      { status: 500 },
    );
  }
}
