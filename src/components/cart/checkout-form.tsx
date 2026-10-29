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
  Info,
  Landmark,
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
import { ProductImage } from "@/components/product/product-image";
import { useCartStore, selectSubtotal } from "@/store/cart-store";
import { formatPkr, cn, variantLabel } from "@/lib/utils";
import { PROVINCES, shippingSchema, type ShippingValues } from "@/lib/validation";
import { WHATSAPP_LINK } from "@/lib/constants";
import {
  COD_CITY,
  DELIVERY_CHARGE,
  advanceAmount,
  isKarachi,
  needsDeliveryQuote,
  paymentMethodsFor,
} from "@/lib/delivery";
import { BankDetails } from "@/components/cart/bank-details";

const METHOD_META: Record<
  string,
  { Icon: typeof Banknote; label: string; blurb: string }
> = {
  COD: {
    Icon: Banknote,
    label: "Cash on Delivery",
    blurb: `Pay the Rs. ${DELIVERY_CHARGE} delivery charge in advance, the rest in cash on delivery. Karachi only.`,
  },
  BANK_TRANSFER: {
    Icon: Landmark,
    label: "Bank Transfer",
    blurb: "Pay the full amount, including delivery, in advance by bank transfer.",
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

export function CheckoutForm({ availableMethods }: { availableMethods: string[] }) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const [step, setStep] = React.useState<Step>("shipping");
  const [method, setMethod] = React.useState(availableMethods[0] ?? "COD");
  const [submitting, setSubmitting] = React.useState(false);

  // Flat delivery charge on every order (see lib/delivery.ts).
  const shipping = DELIVERY_CHARGE;
  const total = subtotal + shipping;

  // Above the bulk threshold delivery is quoted, not charged, so the order
  // cannot be completed here. The server enforces the same rule.
  const totalUnits = items.reduce((n, i) => n + i.quantity, 0);
  const isBulk = needsDeliveryQuote(totalUnits);

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

  // Payment options depend on the city: COD in Karachi, bank transfer elsewhere.
  const city = form.watch("city");
  const inKarachi = isKarachi(city);
  const methods = paymentMethodsFor(city, availableMethods);
  React.useEffect(() => {
    if (methods.length && !methods.includes(method)) setMethod(methods[0]);
  }, [methods, method]);

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

      // The cart is emptied by <ClearCartOnOrder> on the confirmation page, so
      // both payment paths behave the same — a gateway payment leaves the site
      // and only returns there.
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
    // [&>*]:min-w-0 lets both columns shrink to the screen on phones instead of
    // overflowing sideways.
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start [&>*]:min-w-0">
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
              {methods.map((m) => {
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

            {!inKarachi ? (
              <p className="flex gap-2 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed">
                <Info className="mt-0.5 size-3.5 shrink-0 text-brand-700" aria-hidden />
                <span>
                  Cash on Delivery is available in {COD_CITY} only. Outside {COD_CITY}, please pay
                  the full amount by bank transfer.
                </span>
              </p>
            ) : null}

            {isBulk ? (
              <div className="rounded-xl border border-cta-300 bg-cta-50 p-4 text-sm">
                <p className="font-bold">
                  {totalUnits} items — delivery quoted separately
                </p>
                <p className="mt-1 text-muted-foreground">
                  An order this size travels by truck rather than bike, so we
                  agree the delivery charge with you directly. Send us the list
                  on WhatsApp and we will confirm the total and arrange
                  delivery.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 font-semibold text-white"
                >
                  Get a delivery quote on WhatsApp
                </a>
              </div>
            ) : (
              <BankDetails method={method} amount={advanceAmount(method, total)} />
            )}

            <Separator />

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                size="lg"
                disabled={submitting || isBulk}
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
                <ProductImage src={item.image} alt={item.name} illustration={item.illustration} color={item.color.hex} trim={item.color.trim} sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[variantLabel(item.size, item.color.name), `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
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
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="tabular-nums">{formatPkr(shipping)}</dd>
          </div>
        </dl>

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
