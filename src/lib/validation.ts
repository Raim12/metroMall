import { z } from "zod";

/**
 * Schemas shared by the client forms and the route handlers.
 *
 * Keeping them in one module means the browser and the server validate against
 * exactly the same rules — the client copy is a convenience, the server copy is
 * the one that counts.
 */

/** Pakistani numbers, permissive about formatting but not about content. */
const phone = z
  .string()
  .min(7, "Please enter a reachable phone number")
  .max(24, "That phone number looks too long")
  .regex(/^[+\d][\d\s()-]{6,}$/, "That doesn't look like a phone number");

export const exportQuerySchema = z.object({
  firstName: z.string().min(2, "Please enter your first name").max(80),
  lastName: z.string().min(2, "Please enter your last name").max(80),
  phone,
  email: z.string().email("Please enter a valid email address").max(160),
  query: z
    .string()
    .min(20, "Tell us a little more — at least 20 characters")
    .max(2000, "Please keep it under 2000 characters"),
});
export type ExportQueryValues = z.infer<typeof exportQuerySchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(120),
  phone,
  email: z.string().email("Please enter a valid email address").max(160),
  subject: z.string().min(3, "Please add a short subject").max(160),
  message: z
    .string()
    .min(10, "Please give us a little more detail")
    .max(2000, "Please keep it under 2000 characters"),
  consent: z.literal(true, {
    message: "Please accept the terms and conditions",
  }),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const applicationSchema = z.object({
  firstName: z.string().min(2, "Please enter your first name").max(80),
  lastName: z.string().min(2, "Please enter your last name").max(80),
  email: z.string().email("Please enter a valid email address").max(160),
  address: z.string().min(5, "Please enter your address").max(300),
  phone,
  qualification: z.string().min(2, "Please enter your qualification").max(160),
  marks: z.string().min(1, "Please enter your marks or CGPA").max(40),
  field: z.string().min(2, "Please enter your field of study").max(160),
  institute: z.string().min(2, "Please enter your institute").max(160),
  experience: z.string().max(3000, "Please keep it under 3000 characters"),
});
export type ApplicationValues = z.infer<typeof applicationSchema>;

/* ------------------------------- Checkout ------------------------------ */

export const PROVINCES = [
  "Sindh",
  "Punjab",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
  "Islamabad Capital Territory",
] as const;

export const PAYMENT_METHODS = ["COD", "CARD", "EASYPAISA", "JAZZCASH"] as const;

/**
 * A requested line. Note there is no price field — the server looks every price
 * up in the database. A client-supplied price is never trusted.
 */
export const checkoutItemSchema = z.object({
  slug: z.string().min(1),
  size: z.string().min(1).max(40),
  colorName: z.string().min(1).max(80),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(99),
});

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "Please enter your first name").max(80),
  lastName: z.string().min(2, "Please enter your last name").max(80),
  email: z.string().email("Please enter a valid email address").max(160),
  phone,
  addressLine1: z.string().min(5, "Please enter your street address").max(200),
  addressLine2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2, "Please enter your city").max(100),
  province: z.enum(PROVINCES, { message: "Please choose a province" }),
  postalCode: z.string().max(12).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    message: "Please choose a payment method",
  }),
  items: z
    .array(checkoutItemSchema)
    .min(1, "Your cart is empty")
    .max(50, "Too many lines in one order"),
});
export type CheckoutValues = z.infer<typeof checkoutSchema>;

/** The customer/address half, used to drive step 1 of the checkout form. */
export const shippingSchema = checkoutSchema.omit({
  items: true,
  paymentMethod: true,
});
export type ShippingValues = z.infer<typeof shippingSchema>;
