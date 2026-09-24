import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  MessageSquare,
  PackageX,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  getDashboardStats,
  getLowStockProducts,
  getRecentOrders,
  getTopProducts,
} from "@/lib/admin/queries";
import { formatPkr, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, recent, top, lowStock] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(8),
    getTopProducts(5),
    getLowStockProducts(6),
  ]);

  const tiles = [
    {
      label: "Revenue earned",
      value: formatPkr(stats.revenueEarned),
      hint: "Paid and fulfilled orders",
      Icon: Wallet,
      tone: "brand" as const,
    },
    {
      label: "Awaiting collection",
      value: formatPkr(stats.revenuePending),
      hint: `${stats.ordersPending} pending order${stats.ordersPending === 1 ? "" : "s"}`,
      Icon: Clock,
      tone: "muted" as const,
    },
    {
      label: "Last 30 days",
      value: formatPkr(stats.last30DaysRevenue),
      hint: `${stats.last30DaysOrders} order${stats.last30DaysOrders === 1 ? "" : "s"}`,
      Icon: TrendingUp,
      tone: "muted" as const,
    },
    {
      label: "Average order",
      value: stats.averageOrderValue ? formatPkr(stats.averageOrderValue) : "—",
      hint: `${stats.ordersTotal} order${stats.ordersTotal === 1 ? "" : "s"} all time`,
      Icon: Receipt,
      tone: "muted" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue counts paid and fulfilled orders only — Cash on Delivery is
          not income until the courier collects it.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ label, value, hint, Icon, tone }) => (
          <Card key={label} className="gap-2 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <Icon
                className={cn(
                  "size-4",
                  tone === "brand" ? "text-brand-600" : "text-muted-foreground",
                )}
                aria-hidden
              />
            </div>
            <p
              className={cn(
                "font-heading text-2xl font-extrabold tabular-nums",
                tone === "brand" && "text-brand-600",
              )}
            >
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </Card>
        ))}
      </div>

      {/* Attention strip */}
      {stats.outOfStock > 0 ||
      stats.lowStock > 0 ||
      stats.unhandledEnquiries > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.outOfStock > 0 ? (
            <Link href="/admin/products">
              <Card className="gap-1 border-destructive/30 bg-destructive/5 p-4 transition-colors hover:bg-destructive/10">
                <span className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <PackageX className="size-4" aria-hidden />
                  {stats.outOfStock} out of stock
                </span>
                <span className="text-xs text-muted-foreground">
                  Customers cannot order these
                </span>
              </Card>
            </Link>
          ) : null}

          {stats.lowStock > 0 ? (
            <Link href="/admin/products">
              <Card className="gap-1 border-brand-300 bg-brand-50 p-4 transition-colors hover:bg-brand-100">
                <span className="flex items-center gap-2 text-sm font-semibold text-brand-800">
                  <AlertTriangle className="size-4" aria-hidden />
                  {stats.lowStock} running low
                </span>
                <span className="text-xs text-muted-foreground">
                  At or below the reorder level
                </span>
              </Card>
            </Link>
          ) : null}

          {stats.unhandledEnquiries > 0 ? (
            <Link href="/admin/enquiries">
              <Card className="gap-1 p-4 transition-colors hover:bg-muted/60">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <MessageSquare className="size-4" aria-hidden />
                  {stats.unhandledEnquiries} new enquir
                  {stats.unhandledEnquiries === 1 ? "y" : "ies"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Waiting for a reply
                </span>
              </Card>
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Recent orders */}
        <Card className="gap-0 p-0">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-heading text-base font-bold">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
            >
              All orders
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No orders yet. They will appear here the moment one is placed.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-2.5 font-semibold">Order</th>
                    <th className="px-5 py-2.5 font-semibold">Customer</th>
                    <th className="px-5 py-2.5 font-semibold">Status</th>
                    <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-xs font-semibold text-brand-700 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt.toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        {order.firstName} {order.lastName}
                        <p className="text-xs text-muted-foreground">
                          {order.city}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        {formatPkr(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {/* Best sellers */}
          <Card className="gap-0 p-0">
            <div className="border-b px-5 py-4">
              <h2 className="font-heading text-base font-bold">Best sellers</h2>
            </div>
            {top.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No sales yet.
              </p>
            ) : (
              <ul className="divide-y">
                {top.map((p, i) => (
                  <li
                    key={p.slug}
                    className="flex items-center gap-3 px-5 py-3 text-sm"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {p.unitsSold}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Low stock */}
          <Card className="gap-0 p-0">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-heading text-base font-bold">Stock alerts</h2>
              <Link
                href="/admin/products"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Manage
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Every product is above its reorder level.
              </p>
            ) : (
              <ul className="divide-y">
                {lowStock.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-5 py-3 text-sm"
                  >
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="min-w-0 flex-1 truncate hover:text-brand-700"
                    >
                      {p.name}
                    </Link>
                    <Badge
                      variant={p.stock <= 0 ? "destructive" : "secondary"}
                      className="shrink-0 tabular-nums"
                    >
                      {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
