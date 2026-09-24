import "server-only";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, type Prisma } from "@/generated/prisma/client";
import type { CheckoutValues } from "@/lib/validation";

/** Free delivery at or above this order value (whole PKR). */
export const FREE_SHIPPING_THRESHOLD = 20000;
/** Flat delivery charge below the threshold (whole PKR). */
export const FLAT_SHIPPING_FEE = 350;

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

/**
 * Human-facing reference, e.g. `MEC-7QK2XB`.
 *
 * Crockford-ish alphabet: no I/O/U/1/0, so it survives being read over the
 * phone — which is how most COD support calls start.
 */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTVWXYZ";

function orderCode(length = 6): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `MEC-${out}`;
}

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

export interface PricedLine {
  productId: string;
  name: string;
  slug: string;
  size: string;
  colorName: string;
  colorHex: string;
  colorTrim: string;
  illustration: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PricedCart {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

/**
 * Re-prices a requested cart from the database.
 *
 * Every unit price, product name and colour comes from Postgres, never from the
 * request body — otherwise a crafted payload could buy a fan for one rupee.
 * Also validates that each requested size/colour actually exists on the product.
 */
export async function priceCart(
  items: CheckoutValues["items"],
): Promise<PricedCart> {
  const slugs = [...new Set(items.map((i) => i.slug))];

  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, active: true },
    include: { colors: true },
  });

  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lines: PricedLine[] = items.map((item) => {
    const product = bySlug.get(item.slug);
    if (!product) {
      throw new CheckoutError(
        `"${item.slug}" is no longer available.`,
        409,
      );
    }

    if (!product.sizes.includes(item.size)) {
      throw new CheckoutError(
        `${product.name} is not available in size ${item.size}.`,
        409,
      );
    }

    const color = product.colors.find((c) => c.name === item.colorName);
    if (!color) {
      throw new CheckoutError(
        `${product.name} is not available in ${item.colorName}.`,
        409,
      );
    }

    if (product.trackStock && product.stock < item.quantity) {
      throw new CheckoutError(
        product.stock === 0
          ? `${product.name} is out of stock.`
          : `Only ${product.stock} left of ${product.name} — please reduce the quantity.`,
        409,
      );
    }

    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      size: item.size,
      colorName: color.name,
      colorHex: color.hex,
      colorTrim: color.trim,
      illustration: product.illustration,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = calculateShipping(subtotal);

  return { lines, subtotal, shipping, total: subtotal + shipping };
}

/** Derived from Prisma so it always matches the actual selection. */
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

/**
 * Persists an order and its line snapshots in a single transaction.
 *
 * Retries once on the astronomically unlikely order-number collision rather
 * than failing the customer's checkout.
 */
export async function createOrder(
  input: CheckoutValues,
  cart: PricedCart,
): Promise<OrderWithItems> {
  const data = {
    status: "PENDING" as const,
    paymentMethod: input.paymentMethod as PaymentMethod,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2 || null,
    city: input.city,
    province: input.province,
    postalCode: input.postalCode || null,
    notes: input.notes || null,
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
    items: {
      create: cart.lines.map((l) => ({
        productId: l.productId,
        name: l.name,
        slug: l.slug,
        size: l.size,
        colorName: l.colorName,
        colorHex: l.colorHex,
        colorTrim: l.colorTrim,
        illustration: l.illustration,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
      })),
    },
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Decrement stock with the quantity check in the WHERE clause. Two
        // shoppers buying the last unit at once means one `updateMany` matches
        // zero rows, and that order is rejected instead of overselling.
        for (const line of cart.lines) {
          const { count } = await tx.product.updateMany({
            where: {
              id: line.productId,
              trackStock: true,
              stock: { gte: line.quantity },
            },
            data: { stock: { decrement: line.quantity } },
          });

          if (count === 0) {
            // Either it is untracked (fine) or stock ran out between pricing
            // and commit (not fine).
            const current = await tx.product.findUnique({
              where: { id: line.productId },
              select: { trackStock: true, stock: true },
            });

            if (current?.trackStock) {
              throw new CheckoutError(
                `${line.name} sold out while you were checking out. Please adjust your cart.`,
                409,
              );
            }
          }
        }

        return tx.order.create({
          data: { ...data, orderNumber: orderCode() },
          include: { items: true },
        });
      });
    } catch (error) {
      // A genuine stock conflict must surface, not be retried.
      if (error instanceof CheckoutError) throw error;

      const isUniqueViolation =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002";

      if (!isUniqueViolation || attempt === 2) throw error;
    }
  }

  throw new CheckoutError("Could not generate a unique order number.", 500);
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<OrderWithItems | null> {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
}
