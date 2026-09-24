import "server-only";

import { prisma } from "@/lib/prisma";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

/**
 * Read models for the admin dashboard.
 *
 * A note on revenue: Cash on Delivery means money only exists once the courier
 * collects it. So "earned" counts PAID and FULFILLED orders only, and PENDING
 * is reported separately as a pipeline figure. Adding the two together would
 * flatter the numbers and mislead the owner.
 */

const EARNED: OrderStatus[] = ["PAID", "FULFILLED"];

export interface DashboardStats {
  revenueEarned: number;
  revenuePending: number;
  ordersTotal: number;
  ordersPending: number;
  ordersFulfilled: number;
  averageOrderValue: number;
  unhandledEnquiries: number;
  outOfStock: number;
  lowStock: number;
  last30DaysRevenue: number;
  last30DaysOrders: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [earned, pending, counts, recent, enquiries, products] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: EARNED } },
        _sum: { total: true },
        _count: true,
        _avg: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: "PENDING" },
        _sum: { total: true },
      }),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.order.aggregate({
        where: { status: { in: EARNED }, createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.query.count({ where: { handled: false } }),
      prisma.product.findMany({
        where: { active: true, trackStock: true },
        select: { stock: true, lowStockThreshold: true },
      }),
    ]);

  const byStatus = new Map(counts.map((c) => [c.status, c._count]));

  return {
    revenueEarned: earned._sum.total ?? 0,
    revenuePending: pending._sum.total ?? 0,
    ordersTotal: counts.reduce((sum, c) => sum + c._count, 0),
    ordersPending: byStatus.get("PENDING") ?? 0,
    ordersFulfilled: byStatus.get("FULFILLED") ?? 0,
    averageOrderValue: Math.round(earned._avg.total ?? 0),
    unhandledEnquiries: enquiries,
    outOfStock: products.filter((p) => p.stock <= 0).length,
    lowStock: products.filter(
      (p) => p.stock > 0 && p.stock <= p.lowStockThreshold,
    ).length,
    last30DaysRevenue: recent._sum.total ?? 0,
    last30DaysOrders: recent._count,
  };
}

/** Best sellers by units actually sold, excluding cancelled orders. */
export async function getTopProducts(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["slug", "name"],
    where: { order: { status: { notIn: ["CANCELLED", "FAILED"] } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  return grouped.map((g) => ({
    slug: g.slug,
    name: g.name,
    unitsSold: g._sum.quantity ?? 0,
  }));
}

export async function getRecentOrders(limit = 8) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      firstName: true,
      lastName: true,
      city: true,
      total: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
    },
  });
}

export async function getLowStockProducts(limit = 8) {
  const products = await prisma.product.findMany({
    where: { active: true, trackStock: true },
    select: {
      id: true,
      slug: true,
      name: true,
      stock: true,
      lowStockThreshold: true,
    },
    orderBy: { stock: "asc" },
    take: limit,
  });

  return products.filter((p) => p.stock <= p.lowStockThreshold);
}

/* -------------------------------- Orders ------------------------------- */

export async function listOrders(options: {
  status?: OrderStatus;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const page = Math.max(1, options.page ?? 1);
  const perPage = options.perPage ?? 20;

  const where: Prisma.OrderWhereInput = {};
  if (options.status) where.status = options.status;

  if (options.search) {
    const q = options.search.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { items: { select: { id: true, quantity: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, perPage, pages: Math.ceil(total / perPage) };
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({ where: { id }, include: { items: true } });
}

/* ------------------------------- Products ------------------------------ */

export async function listAdminProducts(search?: string) {
  const where: Prisma.ProductWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  return prisma.product.findMany({
    where,
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      stock: true,
      lowStockThreshold: true,
      trackStock: true,
      category: true,
      active: true,
      featured: true,
      images: true,
      illustration: true,
      colors: { orderBy: { position: "asc" }, take: 1 },
    },
  });
}

export async function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      colors: { orderBy: { position: "asc" } },
      features: { orderBy: { position: "asc" } },
      specs: { orderBy: { speed: "asc" } },
    },
  });
}

/* ------------------------------ Enquiries ------------------------------ */

export async function listQueries(handled?: boolean) {
  return prisma.query.findMany({
    where: handled === undefined ? {} : { handled },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
