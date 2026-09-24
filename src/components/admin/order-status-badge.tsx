import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  },
  PAID: {
    label: "Paid",
    className: "bg-brand-100 text-brand-800 hover:bg-brand-100",
  },
  FULFILLED: {
    label: "Fulfilled",
    className: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/15 text-destructive hover:bg-destructive/15",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-sky-100 text-sky-900 hover:bg-sky-100",
  },
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const style = STYLES[status];
  return (
    <Badge className={cn("border-transparent", style.className, className)}>
      {style.label}
    </Badge>
  );
}
