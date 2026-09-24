import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, StickyNote } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { FanIllustration } from "@/components/product/fan-illustration";
import { getOrder } from "@/lib/admin/queries";
import { formatPkr } from "@/lib/utils";
import type { FanVariant } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-extrabold">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
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

        <OrderStatusControl orderId={order.id} current={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <Card className="gap-0 p-0">
          <div className="border-b px-5 py-4">
            <h2 className="font-heading text-base font-bold">Items</h2>
          </div>

          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-4">
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
                    target="_blank"
                    className="truncate text-sm font-semibold hover:text-brand-700"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {item.size} · {item.colorName} · {formatPkr(item.unitPrice)}{" "}
                    each
                  </p>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  ×{item.quantity}
                </span>
                <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums">
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
            <a
              href={`mailto:${order.email}`}
              className="flex items-center gap-2 break-all text-sm text-muted-foreground hover:text-brand-700"
            >
              <Mail className="size-3.5 shrink-0" aria-hidden />
              {order.email}
            </a>
          </Card>

          <Card className="gap-3 p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-bold">
              <MapPin className="size-4 text-brand-600" aria-hidden />
              Delivery address
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
