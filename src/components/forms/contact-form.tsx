"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { contactSchema, type ContactValues } from "@/lib/validation";


export function ContactForm({
  variant = "light",
}: {
  /** `dark` renders on the teal support panel. */
  variant?: "light" | "dark";
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const dark = variant === "dark";

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
      consent: false as unknown as true,
    },
  });

  async function onSubmit(values: ContactValues) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Request failed");
      }

      toast.success("Message sent", {
        description: `Thanks ${values.name}, we usually reply within one business day.`,
      });
      form.reset();
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again, or call us directly.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = dark
    ? "bg-white text-foreground placeholder:text-muted-foreground border-transparent"
    : undefined;
  const labelClass = dark ? "text-white" : undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your name"
                  autoComplete="name"
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className={dark ? "text-cta-300" : undefined} />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Phone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Your phone number"
                    autoComplete="tel"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={dark ? "text-cta-300" : undefined} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Your email"
                    autoComplete="email"
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={dark ? "text-cta-300" : undefined} />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="How can we help you?"
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className={dark ? "text-cta-300" : undefined} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Message</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Please provide as much detail as possibleâ€¦"
                  className={fieldClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className={dark ? "text-cta-300" : undefined} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={Boolean(field.value)}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    className="mt-0.5 size-4 shrink-0 rounded border-input accent-brand-600"
                  />
                </FormControl>
                <FormLabel
                  className={cn(
                    "text-sm font-normal leading-snug",
                    dark ? "text-white" : "text-muted-foreground",
                  )}
                >
                  You agree to our{" "}
                  <Link
                    href="/policies/terms"
                    className="font-medium underline underline-offset-2"
                  >
                    terms and conditions
                  </Link>
                </FormLabel>
              </div>
              <FormMessage className={dark ? "text-cta-300" : undefined} />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className={cn(
            "w-full font-bold",
            dark
              ? "bg-cta-400 text-cta-foreground hover:bg-cta-500"
              : "bg-brand-600 hover:bg-brand-700",
          )}
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="size-4" aria-hidden />
          )}
          {submitting ? "Sendingâ€¦" : "Send Message"}
        </Button>
      </form>
    </Form>
  );
}
