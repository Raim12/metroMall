"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Lock,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FanIllustration } from "@/components/product/fan-illustration";
import { useCartStore, selectSubtotal } from "@/store/cart-store";
import { formatPkr, cn } from "@/lib/utils";
import { PROVINCES, shippingSchema, type ShippingValues } from "@/lib/validation";

const METHOD_META: Record<
  string,
  { Icon: typeof Banknote; label: string; blurb: string }
> = {
  COD: {
    Icon: Banknote,
    label: "Cash on Delivery",
    blurb: "Pay the courier when your fan arrives.",
  },
  CARD: {
    Icon: CreditCard,
    label: "Card",
    blurb: "Visa or Mastercard via our secure gateway.",
  },
  EASYPAISA: {
    Icon: Smartphone,
    label: "EasyPaisa",
    blurb: "Pay from your EasyPaisa wallet.",
  },
  JAZZCASH: {
    Icon: Smartphone,
    label: "JazzCash",
    blurb: "Pay from your JazzCash wallet.",
  },
};

type Step = "shipping" | "payment";

export function CheckoutForm({
  availableMethods,
  freeShippingThreshold,
  flatShippingFee,
}: {
  availableMethods: string[];
  freeShippingThreshold: number;
  flatShippingFee: number;
}) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clear = useCartStore((s) => s.clear);

  const [step, setStep] = React.useState<Step>("shipping");
  const [method, setMethod] = React.useState(availableMethods[0] ?? "COD");
  const [submitting, setSubmitting] = React.useState(false);

  const shipping = subtotal >= freeShippingThreshold ? 0 : flatShippingFee;
  const total = subtotal + shipping;

  const form = useForm<ShippingValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      province: "Sindh",
      postalCode: "",
      notes: "",
    },
  });

  async function placeOrder(shippingValues: ShippingValues) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...shippingValues,
          paymentMethod: method,
          // Only identifiers go over the wire — the server prices the cart.
          items: items.map((i) => ({
            slug: i.slug,
            size: i.size,
            colorName: i.color.name,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Could not place your order.");
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      clear();
      router.push(`/checkout/confirmation/${data.orderNumber}`);
    } catch (error) {
      toast.error("Order not placed", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
      setSubmitting(false);
    }
  }

  if (!hasHydrated) {
    return <Card className="h-80 animate-pulse bg-muted/60" />;
  }

  if (items.length === 0) {
    return (
      <Card className="items-center gap-4 p-10 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-brand-50">
          <ShoppingBag className="size-7 text-brand-500" aria-hidden />
        </div>
        <div>
          <p className="font-semibold">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a fan to the cart before checking out.
          </p>
        </div>
        <Button asChild className="bg-brand-600 hover:bg-brand-700">
          <Link href="/catalogue">Browse the catalogue</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      {/* ------------------------------ Steps ----------------------------- */}
      <div>
        <ol className="mb-6 flex items-center gap-3 text-sm">
          {(["shipping", "payment"] as const).map((s, i) => {
            const done = step === "payment" && s === "shipping";
            const active = step === s;
            return (
              <li key={s} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-7 place-items-center rounded-full text-xs font-bold",
                    active
                      ? "bg-brand-600 text-white"
                      : done
                        ? "bg-brand-100 text-brand-700"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                <span
                  className={cn(
                    "font-medium capitalize",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s === "shipping" ? "Delivery details" : "Payment"}
                </span>
                {i === 0 ? (
                  <span className="h-px w-8 bg-border sm:w-12" aria-hidden />
                ) : null}
              </li>
            );
          })}
        </ol>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(() => setStep("payment"))}
            className={cn("space-y-4", step !== "shipping" && "hidden")}
          >
            <Card className="gap-4 p-6">
              <h2 className="font-heading text-lg font-bold">Delivery details</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input autoComplete="given-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input autoComplete="family-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+92 3XX XXXXXXX"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="House / flat, street"
                        autoComplete="address-line1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Area / landmark{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input autoComplete="address-line2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input autoComplete="address-level2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROVINCES.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Postal{" "}
                        <span className="font-normal text-muted-foreground">
                          (opt.)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input autoComplete="postal-code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Delivery notes{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Nearest landmark, preferred delivery time..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full bg-brand-600 font-semibold hover:bg-brand-700"
              >
                Continue to payment
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Card>
          </form>
        </Form>

        {/* ----------------------------- Payment ---------------------------- */}
        {step === "payment" ? (
          <Card className="gap-4 p-6">
            <h2 className="font-heading text-lg font-bold">Payment method</h2>

            <div className="space-y-2.5">
              {availableMethods.map((m) => {
                const meta = METHOD_META[m];
                if (!meta) return null;
                const selected = method === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      selected
                        ? "border-brand-500 bg-brand-50"
                        : "hover:border-brand-300 hover:bg-muted/50",
                    )}
                  >
                    <meta.Icon
                      className={cn(
                        "mt-0.5 size-5 shrink-0",
                        selected ? "text-brand-600" : "text-muted-foreground",
                      )}
                      aria-hidden
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">
                        {meta.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {meta.blurb}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border-2",
                        selected ? "border-brand-600" : "border-muted-foreground/40",
                      )}
                    >
                      {selected ? (
                        <span className="size-2 rounded-full bg-brand-600" />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {availableMethods.length === 1 ? (
              <p className="text-xs text-muted-foreground">
                Online payment is coming soon. Cash on Delivery is available
                nationwide in the meantime.
              </p>
            ) : null}

            <Separator />

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                size="lg"
                disabled={submitting}
                onClick={form.handleSubmit(placeOrder)}
                className="flex-1 bg-cta-400 font-bold text-cta-foreground hover:bg-cta-500"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Lock className="size-4" aria-hidden />
                )}
                {submitting ? "Placing order..." : `Place order - ${formatPkr(total)}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={submitting}
                onClick={() => setStep("shipping")}
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back
              </Button>
            </div>
          </Card>
        ) : null}
      </div>

      {/* --------------------------- Order summary -------------------------- */}
      <Card className="gap-0 p-6 lg:sticky lg:top-28">
        <h2 className="font-heading text-lg font-bold">Order summary</h2>

        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3">
              <div className="metro-tile grid size-14 shrink-0 place-items-center rounded-lg p-1">
                <FanIllustration
                  variant={item.illustration}
                  color={item.color.hex}
                  trim={item.color.trim}
                  title={item.name}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.size} · {item.color.name} · Qty {item.quantity}
                </p>
              </div>
              <span className="text-sm font-bold tabular-nums">
                {formatPkr(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-5" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPkr(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="tabular-nums">
              {shipping === 0 ? (
                <span className="font-semibold text-leaf-600">Free</span>
              ) : (
                formatPkr(shipping)
              )}
            </dd>
          </div>
        </dl>

        {shipping > 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Free delivery on orders over {formatPkr(freeShippingThreshold)}.
          </p>
        ) : null}

        <Separator className="my-4" />

        <div className="flex items-baseline justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-heading text-xl font-extrabold tabular-nums">
            {formatPkr(total)}
          </span>
        </div>
      </Card>
    </div>
  );
}
