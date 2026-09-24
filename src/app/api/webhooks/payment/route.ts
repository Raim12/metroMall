import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentConfigError, activeGateway } from "@/lib/payments";

/**
 * POST /api/webhooks/payment
 *
 * Gateway callback. The raw body is read as text because signature
 * verification is computed over the exact bytes sent — parsing to JSON first
 * and re-serialising would change them and break verification.
 *
 * Fails closed: anything the provider cannot verify is rejected, and a 4xx is
 * returned rather than silently accepting the event.
 */
export async function POST(request: Request) {
  const gateway = activeGateway();

  if (!gateway) {
    // COD-only deployment: nothing should be posting here.
    return NextResponse.json(
      { error: "No payment gateway is configured." },
      { status: 404 },
    );
  }

  const rawBody = await request.text();

  try {
    const result = await gateway.handleWebhook(rawBody, request.headers);

    if (result.outcome === "ignored") {
      return NextResponse.json({ received: true, applied: false });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: result.orderNumber },
      select: { id: true, status: true },
    });

    if (!order) {
      console.warn(`[webhook] unknown order ${result.orderNumber}`);
      return NextResponse.json({ error: "Unknown order." }, { status: 404 });
    }

    // Gateways retry, so the same event can arrive several times. Only move an
    // order forward from PENDING.
    if (order.status !== "PENDING") {
      return NextResponse.json({ received: true, applied: false });
    }

    await prisma.order.update({
      where: { id: order.id },
      data:
        result.outcome === "paid"
          ? {
              status: "PAID",
              paidAt: new Date(),
              providerRef: result.providerRef ?? undefined,
            }
          : { status: "FAILED", providerRef: result.providerRef ?? undefined },
    });

    return NextResponse.json({ received: true, applied: true });
  } catch (error) {
    if (error instanceof PaymentConfigError) {
      console.error("[webhook] rejected:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[webhook]", error);
    return NextResponse.json(
      { error: "Webhook could not be processed." },
      { status: 400 },
    );
  }
}
