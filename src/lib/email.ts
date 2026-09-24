import "server-only";

import { Resend } from "resend";
import { SITE } from "@/lib/constants";
import { formatPkr } from "@/lib/utils";
import type { OrderWithItems } from "@/lib/orders";

/**
 * Transactional email.
 *
 * Deliberately best-effort: every send is wrapped so that a Resend outage, a
 * missing API key or an unverified domain can never fail a checkout. The order
 * is already committed by the time we get here — losing the email is
 * recoverable, losing the order is not.
 */

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? `Metro Electric Co. <onboarding@resend.dev>`;
const internalTo = process.env.EMAIL_TO_INTERNAL ?? SITE.email;

const resend = apiKey ? new Resend(apiKey) : null;

type SendResult = { sent: boolean; reason?: string };

async function send(options: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping "${options.subject}"`,
    );
    return { sent: false, reason: "no-api-key" };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error("[email] send failed:", error);
      return { sent: false, reason: error.message };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] threw:", error);
    return { sent: false, reason: "exception" };
  }
}

/* ------------------------------- Templates ----------------------------- */

const BRAND = "#F36C21";
const INK = "#2b2b2b";

function shell(title: string, body: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
    <tr><td style="background:${INK};padding:20px 24px">
      <span style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.5px">METR<span style="color:${BRAND}">O</span> ELECTRIC CO.</span>
    </td></tr>
    <tr><td style="padding:24px">
      <h1 style="margin:0 0 16px;font-size:20px;color:${INK}">${title}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:16px 24px;background:#fafafa;font-size:12px;color:#777">
      ${SITE.address.full}<br>
      ${SITE.phone} · <a href="mailto:${SITE.email}" style="color:${BRAND}">${SITE.email}</a>
    </td></tr>
  </table>
</body></html>`;
}

function itemRows(order: OrderWithItems): string {
  return order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">
          <strong>${escapeHtml(i.name)}</strong><br>
          <span style="color:#777;font-size:13px">${escapeHtml(i.size)} · ${escapeHtml(i.colorName)} · Qty ${i.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">
          ${formatPkr(i.unitPrice * i.quantity)}
        </td>
      </tr>`,
    )
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function totalsBlock(order: OrderWithItems): string {
  return `<table role="presentation" width="100%" style="margin-top:12px;font-size:14px">
    <tr><td style="padding:4px 0;color:#777">Subtotal</td><td style="text-align:right">${formatPkr(order.subtotal)}</td></tr>
    <tr><td style="padding:4px 0;color:#777">Delivery</td><td style="text-align:right">${order.shipping === 0 ? "Free" : formatPkr(order.shipping)}</td></tr>
    <tr><td style="padding:8px 0;font-weight:bold;border-top:2px solid ${INK}">Total</td>
        <td style="padding:8px 0;text-align:right;font-weight:bold;border-top:2px solid ${INK}">${formatPkr(order.total)}</td></tr>
  </table>`;
}

const METHOD_LABEL: Record<string, string> = {
  COD: "Cash on Delivery",
  CARD: "Card",
  EASYPAISA: "EasyPaisa",
  JAZZCASH: "JazzCash",
};

/* -------------------------------- Senders ------------------------------ */

export async function sendOrderConfirmation(order: OrderWithItems) {
  const isCod = order.paymentMethod === "COD";

  return send({
    to: order.email,
    replyTo: SITE.email,
    subject: `Order ${order.orderNumber} confirmed — Metro Electric Co.`,
    html: shell(
      `Thanks, ${escapeHtml(order.firstName)} — we've got your order`,
      `<p style="font-size:14px;line-height:1.6">
         Your order <strong>${order.orderNumber}</strong> is confirmed.
         ${
           isCod
             ? `Please keep <strong>${formatPkr(order.total)}</strong> ready for the courier on delivery.`
             : `We'll confirm once your payment clears.`
         }
       </p>
       <table role="presentation" width="100%" style="margin-top:16px;font-size:14px">${itemRows(order)}</table>
       ${totalsBlock(order)}
       <p style="font-size:14px;line-height:1.6;margin-top:20px">
         <strong>Delivering to</strong><br>
         ${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}<br>
         ${escapeHtml(order.addressLine1)}${order.addressLine2 ? `<br>${escapeHtml(order.addressLine2)}` : ""}<br>
         ${escapeHtml(order.city)}, ${escapeHtml(order.province)}${order.postalCode ? ` ${escapeHtml(order.postalCode)}` : ""}<br>
         ${escapeHtml(order.phone)}
       </p>
       <p style="font-size:13px;color:#777">Payment method: ${METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>`,
    ),
  });
}

export async function sendInternalOrderAlert(order: OrderWithItems) {
  return send({
    to: internalTo,
    replyTo: order.email,
    subject: `New ${order.paymentMethod} order ${order.orderNumber} — ${formatPkr(order.total)}`,
    html: shell(
      `New order ${order.orderNumber}`,
      `<table role="presentation" width="100%" style="font-size:14px">${itemRows(order)}</table>
       ${totalsBlock(order)}
       <p style="font-size:14px;line-height:1.6;margin-top:20px">
         <strong>${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}</strong><br>
         ${escapeHtml(order.email)} · ${escapeHtml(order.phone)}<br>
         ${escapeHtml(order.addressLine1)}${order.addressLine2 ? `, ${escapeHtml(order.addressLine2)}` : ""}<br>
         ${escapeHtml(order.city)}, ${escapeHtml(order.province)}
       </p>
       ${order.notes ? `<p style="font-size:13px"><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ""}`,
    ),
  });
}

export async function sendEnquiryAlert(input: {
  kind: "Export" | "Contact";
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  return send({
    to: internalTo,
    replyTo: input.email,
    subject: `${input.kind} enquiry — ${input.name}`,
    html: shell(
      `New ${input.kind.toLowerCase()} enquiry`,
      `<p style="font-size:14px;line-height:1.6">
         <strong>${escapeHtml(input.name)}</strong><br>
         ${escapeHtml(input.email)}${input.phone ? ` · ${escapeHtml(input.phone)}` : ""}
       </p>
       ${input.subject ? `<p style="font-size:14px"><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>` : ""}
       <p style="font-size:14px;line-height:1.6;white-space:pre-wrap;background:#fafafa;padding:12px;border-radius:8px">${escapeHtml(input.message)}</p>`,
    ),
  });
}

export async function sendEnquiryAck(input: { to: string; name: string }) {
  return send({
    to: input.to,
    replyTo: SITE.email,
    subject: "We've received your enquiry — Metro Electric Co.",
    html: shell(
      `Thanks for getting in touch, ${escapeHtml(input.name)}`,
      `<p style="font-size:14px;line-height:1.6">
         Our team has your message and will reply within one business day.
         For anything urgent, call ${SITE.phone} or message us on WhatsApp.
       </p>`,
    ),
  });
}
