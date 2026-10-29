"use client";

import * as React from "react";
import { Check, Copy, Landmark, MessageCircle } from "lucide-react";

import { BANK_ACCOUNT, RECEIPT_NOTE, advanceInstruction } from "@/lib/delivery";
import { SITE } from "@/lib/constants";
import { formatPkr } from "@/lib/utils";

/**
 * Where and how much to transfer, plus how to send the receipt. Shown at
 * checkout and on the order confirmation page; with an order number it also
 * offers a WhatsApp link pre-filled with the order details.
 */
export function BankDetails({
  method,
  amount,
  orderNumber,
  city,
}: {
  method: string;
  /** What the customer must transfer now (delivery only for COD, full total otherwise). */
  amount: number;
  orderNumber?: string;
  /** Delivery city: outside Karachi the instruction explains bilty instead of the delivery charge. */
  city?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT.iban);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the IBAN is still on screen to copy by hand.
    }
  };

  const whatsappText = orderNumber
    ? `Hi ${SITE.name} — here is my payment receipt for order ${orderNumber} (${formatPkr(amount)}).`
    : `Hi ${SITE.name} — here is my payment receipt.`;

  return (
    <div className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
      <p className="text-sm leading-relaxed">
        <span className="font-semibold">Transfer {formatPkr(amount)}</span>{" "}
        <span className="text-muted-foreground">— {advanceInstruction(method, city)}</span>
      </p>

      <dl className="space-y-1.5 rounded-lg bg-white p-3 text-sm">
        <div className="flex items-start gap-2">
          <Landmark className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden />
          <div className="min-w-0 flex-1">
            <dt className="sr-only">Bank</dt>
            <dd className="font-semibold">{BANK_ACCOUNT.bank}</dd>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">IBAN</dt>
            <dd className="break-all font-mono text-sm font-semibold tracking-wide">{BANK_ACCOUNT.iban}</dd>
          </div>
          <button
            type="button"
            onClick={copyIban}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
            aria-label="Copy IBAN"
          >
            {copied ? <Check className="size-3.5 text-leaf-600" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Account title</dt>
          <dd className="font-semibold">{BANK_ACCOUNT.title}</dd>
        </div>
      </dl>

      <p className="text-xs leading-relaxed text-muted-foreground">{RECEIPT_NOTE}</p>

      {orderNumber ? (
        <a
          href={`https://wa.me/${SITE.whatsappDigits}?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noreferrer noopener"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1fb757]"
        >
          <MessageCircle className="size-4" aria-hidden />
          Send receipt on WhatsApp
        </a>
      ) : null}
    </div>
  );
}
