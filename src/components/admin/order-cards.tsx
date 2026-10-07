import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { cn, formatPkr } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

export interface OrderCardData {
  id: string;
  orderNumber: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  city: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  source?: string;
  units?: number;
}

/**
 * Phone layout for order lists: one tappable card per order instead of a
 * table that has to be scrolled sideways (where the order link ended up
 * off-screen). Shown below the `sm` breakpoint; tables take over above it.
 */
export function OrderCards({ orders, className }: { orders: OrderCardData[]; className?: string }) {
  return (
    <ul className={cn("divide-y", className)}>
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/admin/orders/${order.id}`}
            className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold text-brand-700">{order.orderNumber}</span>
                <OrderStatusBadge status={order.status} />
                {order.source === "admin" ? (
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Staff
                  </span>
                ) : null}
              </div>
              <p className="truncate text-sm font-medium">
                {order.firstName} {order.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.city} ·{" "}
                {order.createdAt.toLocaleDateString("en-PK", { day: "numeric", month: "short" })} ·{" "}
                {order.paymentMethod}
                {order.units !== undefined ? ` · ${order.units} item${order.units === 1 ? "" : "s"}` : ""}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPkr(order.total)}</span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
