import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Pencil, Phone, StickyNote } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import { getOrder } from "@/lib/admin/queries";
import { formatPkr, variantLabel } from "@/lib/utils";
import { WALK_IN_ADDRESS } from "@/lib/validation";
import type { FanVariant } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const order = await getOrder(id);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to orders
      </Link>

      {created ? (
        <p className="rounded-xl border border-leaf-500/30 bg-leaf-500/10 px-4 py-3 text-sm font-medium">
          Order {order.orderNumber} recorded.
        </p>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="font-heading text-2xl font-extrabold">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
            {order.source === "admin" ? (
              <span className="rounded-full bg-ink-900/5 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
                Recorded by staff
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed{" "}
            {order.createdAt.toLocaleString("en-PK", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            {order.paidAt
              ? ` · Paid ${order.paidAt.toLocaleDateString("en-PK", { dateStyle: "medium" })}`
              : ""}
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/orders/${order.id}/edit`}>
              <Pencil className="size-4" aria-hidden />
              Edit details
            </Link>
          </Button>
          <DeleteOrderButton orderId={order.id} orderNumber={order.orderNumber} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Change status
        </p>
        <OrderStatusControl orderId={order.id} current={order.status} />
      </div>

      {/* [&>*]:min-w-0 lets the columns shrink on phones instead of widening the page. */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start [&>*]:min-w-0">
        <Card className="gap-0 p-0">
          <div className="border-b px-5 py-4">
            <h2 className="font-heading text-base font-bold">Items</h2>
          </div>

          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-4">
                <div className="metro-tile grid size-14 shrink-0 place-items-center rounded-lg p-1">
                  <ProductImage src={item.image} alt={item.name} illustration={item.illustration as FanVariant} color={item.colorHex} trim={item.colorTrim} sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.slug}`}
                    target="_blank"
                    className="truncate text-sm font-semibold hover:text-brand-700"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {[variantLabel(item.size, item.colorName), formatPkr(item.unitPrice)].filter(Boolean).join(" · ")}{" "}
                    each
                  </p>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  ×{item.quantity}
                </span>
                <span className="shrink-0 text-right text-sm font-semibold tabular-nums sm:w-24">
                  {formatPkr(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t px-5 py-4">
            <dl className="ml-auto max-w-xs space-y-2 text-sm">
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
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPkr(order.total)}</dd>
              </div>
            </dl>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="gap-3 p-5">
            <h2 className="font-heading text-base font-bold">Customer</h2>
            <p className="text-sm font-medium">
              {order.firstName} {order.lastName}
            </p>
            <a
              href={`tel:${order.phone}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-700"
            >
              <Phone className="size-3.5 shrink-0" aria-hidden />
              {order.phone}
            </a>
            {order.email ? (
              <a
                href={`mailto:${order.email}`}
                className="flex items-center gap-2 break-all text-sm text-muted-foreground hover:text-brand-700"
              >
                <Mail className="size-3.5 shrink-0" aria-hidden />
                {order.email}
              </a>
            ) : null}
          </Card>

          <Card className="gap-3 p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-bold">
              <MapPin className="size-4 text-brand-600" aria-hidden />
              {order.addressLine1 === WALK_IN_ADDRESS ? "Shop pickup" : "Delivery address"}
            </h2>
            <address className="text-sm not-italic leading-relaxed text-muted-foreground">
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
            </address>
            <p className="text-xs text-muted-foreground">
              Payment: <strong>{order.paymentMethod}</strong>
            </p>
          </Card>

          {order.notes ? (
            <Card className="gap-2 border-brand-200 bg-brand-50 p-5">
              <h2 className="flex items-center gap-2 font-heading text-base font-bold">
                <StickyNote className="size-4 text-brand-700" aria-hidden />
                Customer note
              </h2>
              <p className="text-sm leading-relaxed">{order.notes}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
