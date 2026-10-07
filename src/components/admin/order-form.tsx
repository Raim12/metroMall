"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, Minus, Plus, Save, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  createManualOrder,
  searchOrderProducts,
  updateOrderDetails,
  type OrderProductOption,
} from "@/lib/admin/order-actions";
import { PAYMENT_METHODS, PROVINCES } from "@/lib/validation";
import { brandName } from "@/lib/constants";
import { FLAT_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/order-pricing";
import { cn, formatPkr, hasChoice, STANDARD_VARIANT } from "@/lib/utils";

const PAYMENT_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  COD: "Cash (COD / at shop)",
  CARD: "Card",
  EASYPAISA: "EasyPaisa",
  JAZZCASH: "JazzCash",
};

const STATUSES = [
  { value: "PENDING", label: "Pending — not paid yet" },
  { value: "PAID", label: "Paid" },
  { value: "FULFILLED", label: "Fulfilled — paid and delivered" },
] as const;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export interface OrderCustomerValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: (typeof PROVINCES)[number];
  postalCode: string;
  notes: string;
  paymentMethod: (typeof PAYMENT_METHODS)[number];
  shipping: number;
}

interface Line {
  key: string;
  product: OrderProductOption;
  size: string;
  colorName: string;
  quantity: number;
  unitPrice: number;
}

const EMPTY: OrderCustomerValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "Karachi",
  province: "Sindh",
  postalCode: "",
  notes: "",
  paymentMethod: "COD",
  shipping: 0,
};

/**
 * Two modes:
 *  - new:  record a phone / walk-in order — customer, products, payment, status
 *  - edit: change an existing order's customer, address, payment and delivery
 */
export function OrderForm(
  props: { mode: "new" } | { mode: "edit"; orderId: string; initial: OrderCustomerValues },
) {
  const [values, setValues] = React.useState<OrderCustomerValues>(
    props.mode === "edit" ? props.initial : EMPTY,
  );
  const [lines, setLines] = React.useState<Line[]>([]);
  const [status, setStatus] = React.useState<(typeof STATUSES)[number]["value"]>("PENDING");
  const [saving, startSaving] = React.useTransition();

  const set = <K extends keyof OrderCustomerValues>(key: K, value: OrderCustomerValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  const addProduct = (product: OrderProductOption) =>
    setLines((ls) => [
      ...ls,
      {
        key: `${product.id}-${Date.now()}`,
        product,
        size: product.sizes[0] ?? STANDARD_VARIANT,
        colorName: product.colors[0] ?? STANDARD_VARIANT,
        quantity: 1,
        unitPrice: product.price,
      },
    ]);

  const updateLine = (key: string, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    startSaving(async () => {
      const result =
        props.mode === "new"
          ? await createManualOrder({
              ...values,
              status,
              items: lines.map((l) => ({
                productId: l.product.id,
                size: l.size,
                colorName: l.colorName,
                quantity: l.quantity,
                unitPrice: l.unitPrice,
              })),
            })
          : await updateOrderDetails(props.orderId, values);
      // createManualOrder redirects on success, so it only returns on failure.
      if (result?.ok) toast.success(result.message ?? "Saved.");
      else if (result) toast.error(result.error);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {props.mode === "new" ? (
        <Card className="gap-4 p-5 sm:p-6">
          <div>
            <h2 className="font-heading text-base font-bold">Products</h2>
            <p className="text-xs text-muted-foreground">
              Search by product name or brand. You can change the price for this order.
            </p>
          </div>

          <ProductPicker onPick={addProduct} />

          {lines.length ? (
            <ul className="divide-y rounded-xl border">
              {lines.map((line) => (
                <li key={line.key} className="space-y-3 p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <Thumb src={line.product.image} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-brand-600">
                        {brandName(line.product.brand)}
                      </p>
                      <p className="text-sm font-semibold leading-snug">{line.product.name}</p>
                      {line.product.stock !== null ? (
                        <p className="text-xs text-muted-foreground">{line.product.stock} in stock</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))}
                      aria-label={`Remove ${line.product.name}`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {hasChoice(line.product.sizes) ? (
                      <div className="space-y-1">
                        <Label className="text-xs">Size</Label>
                        <select
                          value={line.size}
                          onChange={(e) => updateLine(line.key, { size: e.target.value })}
                          className={selectClass}
                        >
                          {line.product.sizes.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    {hasChoice(line.product.colors) ? (
                      <div className="space-y-1">
                        <Label className="text-xs">Colour</Label>
                        <select
                          value={line.colorName}
                          onChange={(e) => updateLine(line.key, { colorName: e.target.value })}
                          className={selectClass}
                        >
                          {line.product.colors.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <div className="flex h-9 items-center rounded-md border">
                        <button
                          type="button"
                          onClick={() => updateLine(line.key, { quantity: Math.max(1, line.quantity - 1) })}
                          aria-label="Decrease quantity"
                          className="grid h-full w-8 place-items-center hover:bg-muted"
                        >
                          <Minus className="size-3.5" aria-hidden />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.key, { quantity: Math.max(1, Number(e.target.value) || 1) })
                          }
                          aria-label="Quantity"
                          className="h-full min-w-0 flex-1 bg-transparent text-center text-sm tabular-nums outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateLine(line.key, { quantity: Math.min(999, line.quantity + 1) })}
                          aria-label="Increase quantity"
                          className="grid h-full w-8 place-items-center hover:bg-muted"
                        >
                          <Plus className="size-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price each (Rs.)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={line.unitPrice}
                        onChange={(e) => updateLine(line.key, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
                        className="tabular-nums"
                      />
                    </div>
                  </div>

                  <p className="text-right text-sm">
                    Line total{" "}
                    <span className="font-semibold tabular-nums">
                      {formatPkr(line.unitPrice * line.quantity)}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No products added yet.
            </p>
          )}
        </Card>
      ) : null}

      <Card className="gap-4 p-5 sm:p-6">
        <h2 className="font-heading text-base font-bold">Customer</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required>
            <Input value={values.firstName} onChange={(e) => set("firstName", e.target.value)} required />
          </Field>
          <Field label="Last name">
            <Input value={values.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </Field>
          <Field label="Phone" required>
            <Input
              type="tel"
              inputMode="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="0300 1234567"
              required
            />
          </Field>
          <Field label="Email" hint="Optional">
            <Input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card className="gap-4 p-5 sm:p-6">
        <div>
          <h2 className="font-heading text-base font-bold">Delivery address</h2>
          <p className="text-xs text-muted-foreground">Leave the address empty for shop pickup.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Address" className="sm:col-span-2">
            <Input value={values.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} />
          </Field>
          <Field label="Address line 2" hint="Optional" className="sm:col-span-2">
            <Input value={values.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
          </Field>
          <Field label="City" required>
            <Input value={values.city} onChange={(e) => set("city", e.target.value)} required />
          </Field>
          <Field label="Province" required>
            <select
              value={values.province}
              onChange={(e) => set("province", e.target.value as OrderCustomerValues["province"])}
              className={selectClass}
            >
              {PROVINCES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Notes" hint="Optional — e.g. delivery time, agreed discount" className="sm:col-span-2">
            <Textarea rows={3} value={values.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card className="gap-4 p-5 sm:p-6">
        <h2 className="font-heading text-base font-bold">Payment</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Payment method" required>
            <select
              value={values.paymentMethod}
              onChange={(e) => set("paymentMethod", e.target.value as OrderCustomerValues["paymentMethod"])}
              className={selectClass}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_LABELS[m]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Delivery charge (Rs.)" hint={`Website default: Rs. ${FLAT_SHIPPING_FEE}, free from ${formatPkr(FREE_SHIPPING_THRESHOLD)}`}>
            <Input
              type="number"
              min={0}
              value={values.shipping}
              onChange={(e) => set("shipping", Math.max(0, Number(e.target.value) || 0))}
              className="tabular-nums"
            />
          </Field>
          {props.mode === "new" ? (
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={selectClass}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>

        {props.mode === "new" ? (
          <dl className="ml-auto w-full max-w-xs space-y-1.5 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPkr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="tabular-nums">{values.shipping ? formatPkr(values.shipping) : "Free"}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPkr(subtotal + values.shipping)}</dd>
            </div>
          </dl>
        ) : null}
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={saving || (props.mode === "new" && lines.length === 0)}
          className="w-full bg-brand-600 hover:bg-brand-700 sm:w-auto"
        >
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {props.mode === "new" ? "Create order" : "Save details"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function Thumb({ src }: { src: string | null }) {
  return (
    <span className="metro-tile relative block size-14 shrink-0 overflow-hidden rounded-lg">
      {src ? <Image src={src} alt="" fill sizes="56px" className="object-contain p-1" /> : null}
    </span>
  );
}

/** Debounced search box that lists matching products to add to the order. */
function ProductPicker({ onPick }: { onPick: (p: OrderProductOption) => void }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<OrderProductOption[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const id = window.setTimeout(async () => {
      setLoading(true);
      try {
        const found = await searchOrderProducts(q);
        if (!cancelled) setResults(found);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [query]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name or brand…"
        aria-label="Search products to add"
        className="pl-9 pr-9"
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-2.5 size-4 animate-spin text-muted-foreground" aria-hidden />
      ) : query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="absolute right-2 top-1.5 rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}

      {results.length ? (
        <ul className="mt-2 max-h-80 divide-y overflow-y-auto rounded-xl border bg-white shadow-sm">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(p);
                  setQuery("");
                  setResults([]);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted"
              >
                <Thumb src={p.image} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.7rem] font-bold uppercase tracking-wider text-brand-600">
                    {brandName(p.brand)}
                    {!p.active ? <span className="ml-1.5 text-muted-foreground">· hidden on site</span> : null}
                  </span>
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPkr(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : query.trim().length >= 2 && !loading ? (
        <p className="mt-2 text-sm text-muted-foreground">No products match “{query.trim()}”.</p>
      ) : null}
    </div>
  );
}
