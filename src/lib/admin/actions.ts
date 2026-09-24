"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import {
  UploadError,
  deleteProductImage,
  saveProductImage,
} from "@/lib/admin/storage";
import { Category, OrderStatus } from "@/generated/prisma/client";

/**
 * Admin mutations.
 *
 * Every action re-checks the session itself. `middleware.ts` guards page
 * navigations, but a Server Action is a POST endpoint that can be invoked
 * directly, so it must not rely on the middleware having run.
 */

async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

/* -------------------------------- Session ------------------------------ */

export async function signOut(): Promise<never> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/* --------------------------------- Stock ------------------------------- */

const stockSchema = z.object({
  productId: z.string().min(1),
  stock: z.coerce.number().int().min(0).max(1_000_000),
});

export async function updateStock(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = stockSchema.safeParse({
    productId: formData.get("productId"),
    stock: formData.get("stock"),
  });
  if (!parsed.success) return { ok: false, error: "Enter a whole number of units." };

  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { stock: parsed.data.stock },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { ok: true, message: "Stock updated." };
}

/** Relative adjustment, clamped at zero so stock can never go negative. */
export async function adjustStock(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  const delta = Number(formData.get("delta") ?? 0);

  if (!productId || !Number.isInteger(delta)) {
    return { ok: false, error: "Invalid adjustment." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });
  if (!product) return { ok: false, error: "Product not found." };

  await prisma.product.update({
    where: { id: productId },
    data: { stock: Math.max(0, product.stock + delta) },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { ok: true };
}

/* -------------------------------- Orders ------------------------------- */

export async function updateOrderStatus(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  if (!id || !Object.values(OrderStatus).includes(status)) {
    return { ok: false, error: "Invalid order status." };
  }

  const existing = await prisma.order.findUnique({
    where: { id },
    select: { status: true, paidAt: true },
  });
  if (!existing) return { ok: false, error: "Order not found." };

  await prisma.order.update({
    where: { id },
    data: {
      status,
      // Stamp the payment time the first time it is marked paid or fulfilled.
      paidAt:
        (status === "PAID" || status === "FULFILLED") && !existing.paidAt
          ? new Date()
          : existing.paidAt,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  return { ok: true, message: `Order marked ${status.toLowerCase()}.` };
}

/* ------------------------------- Products ------------------------------ */

const productSchema = z.object({
  name: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  tagline: z.string().min(2).max(200),
  description: z.string().min(10).max(4000),
  price: z.coerce.number().int().min(1).max(10_000_000),
  compareAtPrice: z.coerce.number().int().min(0).max(10_000_000).optional(),
  category: z.enum(Category),
  sizes: z.string().min(1),
  illustration: z.string().min(1),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  lowStockThreshold: z.coerce.number().int().min(0).max(10_000),
  trackStock: z.coerce.boolean(),
  featured: z.coerce.boolean(),
  active: z.coerce.boolean(),
  badge: z.string().max(60).optional(),
  inTheBox: z.string().max(2000).optional(),
});

/** "56\", 48\"" -> ['56"', '48"'] */
function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function readProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    category: formData.get("category"),
    sizes: formData.get("sizes"),
    illustration: formData.get("illustration"),
    stock: formData.get("stock"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    trackStock: formData.get("trackStock") === "on",
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    badge: formData.get("badge") || undefined,
    inTheBox: formData.get("inTheBox") || undefined,
  });
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = readProductForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Please check the highlighted fields.",
    };
  }
  const d = parsed.data;

  const clash = await prisma.product.findUnique({ where: { slug: d.slug } });
  if (clash) return { ok: false, error: `The slug "${d.slug}" is already in use.` };

  const product = await prisma.product.create({
    data: {
      name: d.name,
      slug: d.slug,
      tagline: d.tagline,
      description: d.description,
      price: d.price,
      compareAtPrice: d.compareAtPrice || null,
      category: d.category,
      sizes: splitList(d.sizes),
      illustration: d.illustration,
      stock: d.stock,
      lowStockThreshold: d.lowStockThreshold,
      trackStock: d.trackStock,
      featured: d.featured,
      active: d.active,
      badge: d.badge || null,
      inTheBox: splitList(d.inTheBox),
      // A product needs at least one colourway for the storefront to render.
      colors: {
        create: [
          { name: "Onyx Black", hex: "#1f2224", trim: "#c9a227", position: 0 },
        ],
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalogue");
  redirect(`/admin/products/${product.id}?created=1`);
}

export async function updateProduct(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing product id." };

  const parsed = readProductForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Please check the highlighted fields.",
    };
  }
  const d = parsed.data;

  const clash = await prisma.product.findFirst({
    where: { slug: d.slug, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { ok: false, error: `The slug "${d.slug}" is already in use.` };

  await prisma.product.update({
    where: { id },
    data: {
      name: d.name,
      slug: d.slug,
      tagline: d.tagline,
      description: d.description,
      price: d.price,
      compareAtPrice: d.compareAtPrice || null,
      category: d.category,
      sizes: splitList(d.sizes),
      illustration: d.illustration,
      stock: d.stock,
      lowStockThreshold: d.lowStockThreshold,
      trackStock: d.trackStock,
      featured: d.featured,
      active: d.active,
      badge: d.badge || null,
      inTheBox: splitList(d.inTheBox),
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/catalogue");
  revalidatePath(`/product/${d.slug}`);
  return { ok: true, message: "Product saved." };
}

/** Soft delete — hides from the storefront but preserves order history. */
export async function setProductActive(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return { ok: false, error: "Missing product id." };

  await prisma.product.update({ where: { id }, data: { active } });

  revalidatePath("/admin/products");
  revalidatePath("/catalogue");
  return { ok: true, message: active ? "Product published." : "Product hidden." };
}

/* -------------------------------- Images ------------------------------- */

export async function uploadProductImage(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("productId") ?? "");
  const file = formData.get("image");

  if (!id) return { ok: false, error: "Missing product id." };
  if (!(file instanceof File)) return { ok: false, error: "No file received." };

  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, images: true },
  });
  if (!product) return { ok: false, error: "Product not found." };

  try {
    const url = await saveProductImage(file, product.slug);

    await prisma.product.update({
      where: { id },
      data: { images: [...product.images, url] },
    });

    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/admin/products");
    revalidatePath("/catalogue");
    revalidatePath(`/product/${product.slug}`);
    return { ok: true, message: "Image uploaded." };
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, error: error.message };
    console.error("[admin] image upload failed:", error);
    return { ok: false, error: "Could not save that image." };
  }
}

export async function deleteProductImageAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("productId") ?? "");
  const url = String(formData.get("url") ?? "");
  if (!id || !url) return { ok: false, error: "Missing image reference." };

  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, images: true },
  });
  if (!product) return { ok: false, error: "Product not found." };

  await prisma.product.update({
    where: { id },
    data: { images: product.images.filter((i) => i !== url) },
  });
  await deleteProductImage(url);

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/catalogue");
  revalidatePath(`/product/${product.slug}`);
  return { ok: true, message: "Image removed." };
}

/** Promotes an image to first position, which is what the storefront shows. */
export async function makePrimaryImage(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("productId") ?? "");
  const url = String(formData.get("url") ?? "");
  if (!id || !url) return { ok: false, error: "Missing image reference." };

  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, images: true },
  });
  if (!product) return { ok: false, error: "Product not found." };

  await prisma.product.update({
    where: { id },
    data: { images: [url, ...product.images.filter((i) => i !== url)] },
  });

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/catalogue");
  revalidatePath(`/product/${product.slug}`);
  return { ok: true, message: "Primary image updated." };
}

/* ------------------------------ Enquiries ------------------------------ */

export async function toggleQueryHandled(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const handled = formData.get("handled") === "true";
  if (!id) return { ok: false, error: "Missing enquiry id." };

  await prisma.query.update({ where: { id }, data: { handled } });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { ok: true };
}
