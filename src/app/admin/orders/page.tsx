import Link from "next/link";
import { Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { listOrders } from "@/lib/admin/queries";
import { formatPkr, cn } from "@/lib/utils";
import { OrderStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: "All" },
  { label: "Pending", value: OrderStatus.PENDING },
  { label: "Paid", value: OrderStatus.PAID },
  { label: "Fulfilled", value: OrderStatus.FULFILLED },
  { label: "Cancelled", value: OrderStatus.CANCELLED },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;

  const status = Object.values(OrderStatus).includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;

  const { orders, total, page, pages } = await listOrders({
    status,
    search: params.q,
    page: Number(params.page) || 1,
  });

  const buildHref = (next: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { status: params.status, q: params.q, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const qs = sp.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} order{total === 1 ? "" : "s"} total
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Link
              key={f.label}
              href={buildHref({ status: f.value, page: undefined })}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                status === f.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "bg-white hover:border-brand-300",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <form action="/admin/orders" className="relative ml-auto w-full sm:w-64">
          {params.status ? (
            <input type="hidden" name="status" value={params.status} />
          ) : null}
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Order no, name, email, phone"
            aria-label="Search orders"
            className="bg-white pl-9"
          />
        </form>
      </div>

      <Card className="gap-0 p-0">
        {orders.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">
            No orders match this view.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const units = order.items.reduce(
                    (sum, i) => sum + i.quantity,
                    0,
                  );
                  return (
                    <tr
                      key={order.id}
                      className="border-b transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-xs font-semibold text-brand-700 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt.toLocaleString("en-PK", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        {order.firstName} {order.lastName}
                        <p className="text-xs text-muted-foreground">
                          {order.city}, {order.province}
                        </p>
                      </td>
                      <td className="px-5 py-3 tabular-nums">{units}</td>
                      <td className="px-5 py-3 text-xs">{order.paymentMethod}</td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        {formatPkr(order.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              <Link href={buildHref({ page: String(page - 1) })}>Previous</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className={page >= pages ? "pointer-events-none opacity-50" : ""}
            >
              <Link href={buildHref({ page: String(page + 1) })}>Next</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
