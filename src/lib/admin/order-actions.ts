"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/guard";
import { CheckoutError, persistOrder, snapshotLines, type PricedLine } from "@/lib/orders";
import { PAYMENT_METHODS, PROVINCES, WALK_IN_ADDRESS } from "@/lib/validation";
import { STANDARD_VARIANT } from "@/lib/utils";
import { PaymentMethod } from "@/generated/prisma/client";

/**
 * Orders recorded by staff — phone and walk-in sales — plus editing and
 * deleting orders. These share stock handling and order numbering with the
 * storefront checkout (persistOrder), so the books stay consistent.
 *
 * Unlike checkout, the unit price IS taken from the form: the owner may agree
 * a different price on the phone. This is safe because only a signed-in admin
 * can call these actions.
 */

export type OrderActionResult = { ok: true; message?: string } | { ok: false; error: string };

const phone = z
  .string()
  .trim()
  .min(7, "Enter the customer's phone number")
  .max(24, "That phone number looks too long")
  .regex(/^[+\d][\d\s()-]{6,}$/, "That doesn't look like a phone number");

const customerSchema = z.object({
  firstName: z.string().trim().min(1, "Enter the customer's name").max(80),
  lastName: z.string().trim().max(80).default(""),
  phone,
  email: z.union([z.literal(""), z.string().trim().email("That email address isn't valid").max(160)]).default(""),
  addressLine1: z.string().trim().max(200).default(""),
  addressLine2: z.string().trim().max(200).default(""),
  city: z.string().trim().min(2, "Enter a city").max(100),
  province: z.enum(PROVINCES, { message: "Choose a province" }),
  postalCode: z.string().trim().max(12).default(""),
  notes: z.string().trim().max(1000).default(""),
  paymentMethod: z.enum(PAYMENT_METHODS, { message: "Choose a payment method" }),
  shipping: z.coerce.number().int().min(0, "Delivery can't be negative").max(1_000_000),
});

const manualOrderSchema = customerSchema.extend({
  status: z.enum(["PENDING", "PAID", "FULFILLED"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().max(40).default(STANDARD_VARIANT),
        colorName: z.string().max(80).default(STANDARD_VARIANT),
        quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(999),
        unitPrice: z.coerce.number().int().min(0, "Price can't be negative").max(10_000_000),
      }),
    )
    .min(1, "Add at least one product")
    .max(50),
});
export type ManualOrderInput = z.input<typeof manualOrderSchema>;

const firstError = (error: z.ZodError) => error.issues[0]?.message ?? "Please check the form.";

function customerFields(d: z.infer<typeof customerSchema>) {
  return {
    paymentMethod: d.paymentMethod as PaymentMethod,
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email.toLowerCase(),
    phone: d.phone,
    addressLine1: d.addressLine1 || WALK_IN_ADDRESS,
    addressLine2: d.addressLine2 || null,
    city: d.city,
    province: d.province,
    postalCode: d.postalCode || null,
    notes: d.notes || null,
  };
}

/* ------------------------------ Create -------------------------------- */

export async function createManualOrder(input: ManualOrderInput): Promise<OrderActionResult> {
  await requireAdmin();

  const parsed = manualOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  // Any product may be sold here, including ones hidden from the shop.
  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(d.items.map((i) => i.productId))] } },
    include: { colors: { orderBy: { position: "asc" } } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedLine[] = [];
  for (const item of d.items) {
    const product = byId.get(item.productId);
    if (!product) return { ok: false, error: "One of the products no longer exists. Remove it and try again." };
    const color = product.colors.find((c) => c.name === item.colorName) ?? product.colors[0];
    lines.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      size: product.sizes.includes(item.size) ? item.size : (product.sizes[0] ?? STANDARD_VARIANT),
      colorName: color?.name ?? STANDARD_VARIANT,
      colorHex: color?.hex ?? "#d6d3d1",
      colorTrim: color?.trim ?? "#a8a29e",
      illustration: product.illustration,
      image: product.images[0] ?? null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.unitPrice * item.quantity,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  let orderId: string;
  try {
    const order = await persistOrder(
      {
        ...customerFields(d),
        status: d.status,
        source: "admin",
        paidAt: d.status === "PENDING" ? null : new Date(),
        subtotal,
        shipping: d.shipping,
        total: subtotal + d.shipping,
        items: { create: snapshotLines(lines) },
      },
      lines,
    );
    orderId = order.id;
  } catch (error) {
    if (error instanceof CheckoutError) {
      // persistOrder words this for shoppers ("X sold out while you were checking out…").
      const name = error.message.split(" sold out")[0];
      return {
        ok: false,
        error: `Not enough stock of ${name}. Lower the quantity, or update its stock on the Products page.`,
      };
    }
    throw error;
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect(`/admin/orders/${orderId}?created=1`);
}

/* ------------------------------ Update -------------------------------- */

export async function updateOrderDetails(
  orderId: string,
  input: z.input<typeof customerSchema>,
): Promise<OrderActionResult> {
  await requireAdmin();

  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const d = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { subtotal: true } });
  if (!order) return { ok: false, error: "Order not found." };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      ...customerFields(d),
      shipping: d.shipping,
      // The total always follows the delivery charge.
      total: order.subtotal + d.shipping,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { ok: true, message: "Order details saved." };
}

/* ------------------------------ Delete -------------------------------- */

/**
 * Removes an order entirely — meant for test or duplicate orders. Real
 * cancellations should use the Cancel status, which keeps the record.
 * Stock taken by the order is put back unless it was already cancelled
 * (a cancelled order's stock has been dealt with by the owner).
 */
export async function deleteOrder(orderId: string): Promise<OrderActionResult> {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { productId: true, quantity: true } } },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const restock = !["CANCELLED", "REFUNDED", "FAILED"].includes(order.status);

  await prisma.$transaction(async (tx) => {
    if (restock) {
      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.product.updateMany({
          where: { id: item.productId, trackStock: true },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    await tx.order.delete({ where: { id: orderId } });
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect("/admin/orders?deleted=1");
}

/* --------------------------- Product search --------------------------- */

export interface OrderProductOption {
  id: string;
  name: string;
  brand: string;
  price: number;
  sizes: string[];
  colors: string[];
  image: string | null;
  active: boolean;
  stock: number | null;
}

/** Product picker for the new-order form: matches name, brand or slug. */
export async function searchOrderProducts(query: string): Promise<OrderProductOption[]> {
  await requireAdmin();

  const terms = query.trim().split(/\s+/).filter(Boolean).slice(0, 5);
  if (!terms.length) return [];

  const rows = await prisma.product.findMany({
    where: {
      AND: terms.map((t) => ({
        OR: [
          { name: { contains: t, mode: "insensitive" as const } },
          { brand: { contains: t, mode: "insensitive" as const } },
          { slug: { contains: t.toLowerCase() } },
        ],
      })),
    },
    include: { colors: { orderBy: { position: "asc" }, select: { name: true } } },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    take: 12,
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    sizes: p.sizes,
    colors: p.colors.map((c) => c.name),
    image: p.images[0] ?? null,
    active: p.active,
    stock: p.trackStock ? p.stock : null,
  }));
}
