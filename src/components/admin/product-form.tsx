"use client";

import * as React from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProduct, updateProduct } from "@/lib/admin/actions";
import type { ActionResult } from "@/lib/admin/actions";

const CATEGORIES = [
  { value: "CEILING_FANS", label: "Ceiling Fans" },
  { value: "FALSE_CEILING_FANS", label: "False Ceiling Fans" },
  { value: "PEDESTAL_FANS", label: "Pedestal Fans" },
  { value: "EXHAUST_FANS", label: "Exhaust Fans" },
  { value: "BRACKET_FANS", label: "Bracket Fans" },
];

const ILLUSTRATIONS = [
  "ceiling-3",
  "ceiling-5",
  "ceiling-8",
  "pedestal",
  "exhaust",
  "false-ceiling",
  "bracket",
  "socket-light",
];

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  sizes: string[];
  illustration: string;
  stock: number;
  lowStockThreshold: number;
  trackStock: boolean;
  featured: boolean;
  active: boolean;
  badge: string | null;
  inTheBox: string[];
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ProductForm({ product }: { product?: ProductFormValues }) {
  const isEdit = Boolean(product?.id);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      // createProduct redirects on success, so it only returns on failure.
      const result: ActionResult = isEdit
        ? await updateProduct(formData)
        : await createProduct(formData);

      if (result?.ok) {
        toast.success(result.message ?? "Saved.");
      } else if (result) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}

      <Card className="gap-4 p-6">
        <h2 className="font-heading text-base font-bold">Basics</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <Input
              id="name"
              name="name"
              defaultValue={product?.name}
              required
              placeholder="Metro Nitro Inverter"
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="slug"
            hint="Appears in the URL: /product/your-slug"
          >
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              required
              pattern="[a-z0-9-]+"
              placeholder="metro-nitro-inverter"
              className="font-mono text-sm"
            />
          </Field>
        </div>

        <Field label="Tagline" htmlFor="tagline">
          <Input
            id="tagline"
            name="tagline"
            defaultValue={product?.tagline}
            required
            placeholder="The all-rounder of the E-Force line-up"
          />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            required
            rows={5}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" htmlFor="category">
            <select
              id="category"
              name="category"
              defaultValue={product?.category ?? "CEILING_FANS"}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Illustration"
            htmlFor="illustration"
            hint="Used when no photo has been uploaded"
          >
            <select
              id="illustration"
              name="illustration"
              defaultValue={product?.illustration ?? "ceiling-3"}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {ILLUSTRATIONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card className="gap-4 p-6">
        <h2 className="font-heading text-base font-bold">Pricing &amp; stock</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (PKR)" htmlFor="price" hint="Whole rupees">
            <Input
              id="price"
              name="price"
              type="number"
              min={1}
              step={1}
              defaultValue={product?.price}
              required
            />
          </Field>
          <Field
            label="Compare-at price"
            htmlFor="compareAtPrice"
            hint="Optional. Shown struck through."
          >
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              min={0}
              step={1}
              defaultValue={product?.compareAtPrice ?? ""}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Units in stock" htmlFor="stock">
            <Input
              id="stock"
              name="stock"
              type="number"
              min={0}
              step={1}
              defaultValue={product?.stock ?? 0}
              required
            />
          </Field>
          <Field
            label="Low stock alert at"
            htmlFor="lowStockThreshold"
            hint="Flagged on the dashboard at or below this"
          >
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              step={1}
              defaultValue={product?.lowStockThreshold ?? 5}
              required
            />
          </Field>
        </div>

        <Field
          label="Sizes"
          htmlFor="sizes"
          hint={'Comma separated, e.g. 56", 48"'}
        >
          <Input
            id="sizes"
            name="sizes"
            defaultValue={product?.sizes.join(", ")}
            required
            placeholder={'56", 48"'}
          />
        </Field>

        <Field
          label="In the box"
          htmlFor="inTheBox"
          hint="One item per line, or comma separated"
        >
          <Textarea
            id="inTheBox"
            name="inTheBox"
            defaultValue={product?.inTheBox.join("\n")}
            rows={4}
          />
        </Field>

        <Field
          label="Badge"
          htmlFor="badge"
          hint='Optional ribbon, e.g. "Best Seller"'
        >
          <Input id="badge" name="badge" defaultValue={product?.badge ?? ""} />
        </Field>

        <div className="flex flex-wrap gap-6 pt-1">
          {[
            {
              name: "trackStock",
              label: "Track stock",
              defaultChecked: product?.trackStock ?? true,
              hint: "Off = always orderable",
            },
            {
              name: "featured",
              label: "Featured",
              defaultChecked: product?.featured ?? false,
              hint: "Shows on the homepage",
            },
            {
              name: "active",
              label: "Published",
              defaultChecked: product?.active ?? true,
              hint: "Off = hidden from the shop",
            },
          ].map((c) => (
            <label key={c.name} className="flex items-start gap-2.5">
              <input
                type="checkbox"
                name={c.name}
                defaultChecked={c.defaultChecked}
                className="mt-0.5 size-4 accent-brand-600"
              />
              <span>
                <span className="block text-sm font-medium">{c.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {c.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="bg-brand-600 font-semibold hover:bg-brand-700"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {isEdit ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
