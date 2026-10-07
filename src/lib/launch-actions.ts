"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { HOUSE_BRANDS } from "@/lib/constants";

/**
 * Public "notify me" sign-up for the house-brand launch page.
 *
 * Spam handling without a third-party service: a hidden honeypot field that
 * people never see (bots fill it), and one row per phone per brand, so repeat
 * submissions update instead of piling up.
 */

const signupSchema = z.object({
  brand: z.enum(HOUSE_BRANDS.map((b) => b.slug) as [string, ...string[]]),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter your phone number")
    .max(24, "That phone number looks too long")
    .regex(/^[+\d][\d\s()-]{6,}$/, "That doesn't look like a phone number"),
  city: z.string().trim().max(60).optional().default(""),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().default(""),
});

export type LaunchSignupInput = z.input<typeof signupSchema>;
export type LaunchSignupResult = { ok: true } | { ok: false; error: string };

/** "0300 123-4567" and "03001234567" are the same person. */
const normalisePhone = (phone: string) => phone.replace(/[\s()-]/g, "");

export async function joinLaunchList(input: LaunchSignupInput): Promise<LaunchSignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    // A filled honeypot is a bot: report success so it learns nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: true };
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { brand, name, city } = parsed.data;
  const phone = normalisePhone(parsed.data.phone);

  await prisma.launchSignup.upsert({
    where: { brand_phone: { brand, phone } },
    create: { brand, name, phone, city: city || null },
    // A repeat sign-up with the optional city left blank keeps the one we have.
    update: { name, ...(city ? { city } : {}) },
  });

  return { ok: true };
}
