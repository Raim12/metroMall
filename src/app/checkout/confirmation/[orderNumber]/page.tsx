import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Truck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FanIllustration } from "@/components/product/fan-illustration";
import { getOrderByNumber } from "@/lib/orders";
import { formatPkr } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import type { FanVariant } from "@/types";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const METHOD_LABEL: Record<string, string> = {
  COD: "Cash on Delivery",
  CARD: "Card",
  EASYPAISA: "EasyPaisa",
  JAZZCASH: "JazzCash",
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));

  if (!order) notFound();

  const isCod = order.paymentMethod === "COD";
  // A gateway order stays PENDING until the webhook confirms settlement, so
  // don't tell the customer their payment succeeded before it actually has.
  const awaitingPayment = !isCod && order.status === "PENDING";
  const paymentFailed = order.status === "FAILED";

  return (
    <div className="metro-wash">
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100">
            <CheckCircle2 className="size-8 text-brand-600" aria-hidden />
          </div>
          <h1 className="mt-5 font-heading text-3xl font-extrabold sm:text-4xl">
            Thanks, {order.firstName}!
          </h1>
          <p className="mt-3 text-muted-foreground">
            {paymentFailed ? (
              <>
                Your payment did not go through, so this order is on hold.
                Nothing has been charged.
              </>
            ) : awaitingPayment ? (
              <>
                Your order is placed and we&apos;re confirming the payment with
                your bank. This usually takes a moment.
              </>
            ) : (
              <>
                Your order is confirmed. We&apos;ve emailed a copy to{" "}
                <span className="font-medium text-foreground">
                  {order.email}
                </span>
                .
              </>
            )}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 font-heading text-sm font-bold">
            Order <span className="text-brand-600">{order.orderNumber}</span>
          </p>
        </div>

        <Card className="mt-10 gap-0 p-6 sm:p-8">
          <h2 className="font-heading text-lg font-bold">What you ordered</h2>

          <ul className="mt-5 space-y-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="metro-tile grid size-14 shrink-0 place-items-center rounded-lg p-1">
                  <FanIllustration
                    variant={item.illustration as FanVariant}
                    color={item.colorHex}
                    trim={item.colorTrim}
                    title={item.name}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="truncate text-sm font-semibold hover:text-brand-700"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {item.size} · {item.colorName} · Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums">
                  {formatPkr(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <Separator className="my-5" />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPkr(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="tabular-nums">
                {order.shipping === 0 ? "Free" : formatPkr(order.shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPkr(order.total)}</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Truck className="size-3.5" aria-hidden />
                Delivering to
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                {order.firstName} {order.lastName}
                <br />
                {order.addressLine1}
                {order.addressLine2 ? (
                  <>
                    <br />
                    {order.addressLine2}
                  </>
                ) : null}
                <br />
                {order.city}, {order.province}
                {order.postalCode ? ` ${order.postalCode}` : ""}
                <br />
                {order.phone}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Package className="size-3.5" aria-hidden />
                Payment
              </p>
              <p className="mt-2 text-sm">
                {METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
              </p>
              {isCod ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Please keep{" "}
                  <span className="font-semibold text-foreground">
                    {formatPkr(order.total)}
                  </span>{" "}
                  ready for the courier.
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Dispatch is usually within 48 hours. Questions? Call{" "}
            <a
              href={`tel:+${SITE.phoneDigits}`}
              className="font-semibold text-brand-700 hover:underline"
            >
              {SITE.phone}
            </a>{" "}
            and quote your order number.
          </p>
          <Button asChild className="mt-5 bg-brand-600 hover:bg-brand-700">
            <Link href="/catalogue">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
