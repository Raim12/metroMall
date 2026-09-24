"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UploadCloud, FileCheck2, X } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const MAX_RESUME_BYTES = 1024 * 1024; // 1 MB
const ACCEPTED = [".pdf", ".doc", ".docx"];

export const applicationSchema = z.object({
  firstName: z.string().min(2, "Please enter your first name"),
  lastName: z.string().min(2, "Please enter your last name"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(5, "Please enter your address"),
  phone: z
    .string()
    .min(7, "Please enter a reachable phone number")
    .regex(/^[+\d][\d\s()-]{6,}$/, "That doesn't look like a phone number"),
  qualification: z.string().min(2, "Please enter your qualification"),
  marks: z.string().min(1, "Please enter your marks or CGPA"),
  field: z.string().min(2, "Please enter your field of study"),
  institute: z.string().min(2, "Please enter your institute"),
  experience: z.string().max(3000, "Please keep it under 3000 characters"),
});

export type ApplicationValues = z.infer<typeof applicationSchema>;

export function JoinUsForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [resume, setResume] = React.useState<File | null>(null);
  const [resumeError, setResumeError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      phone: "",
      qualification: "",
      marks: "",
      field: "",
      institute: "",
      experience: "",
    },
  });

  function handleFile(file: File | null) {
    if (!file) {
      setResume(null);
      setResumeError(null);
      return;
    }
    const name = file.name.toLowerCase();
    if (!ACCEPTED.some((ext) => name.endsWith(ext))) {
      setResumeError("Please upload a PDF, DOC or DOCX file.");
      setResume(null);
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("That file is over 1 MB. Please upload a smaller version.");
      setResume(null);
      return;
    }
    setResumeError(null);
    setResume(file);
  }

  async function onSubmit(values: ApplicationValues) {
    if (!resume) {
      setResumeError("Please attach your resume.");
      return;
    }

    setSubmitting(true);
    try {
      // Phase 2: POST multipart/form-data to /api/careers, store in Prisma,
      // notify the hiring inbox via Resend.
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success("Application received", {
        description: `Thanks ${values.firstName} — we'll be in touch if there's a fit.`,
      });
      form.reset();
      setResume(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal */}
        <section className="space-y-4">
          <h2 className="font-heading text-base font-bold">
            Personal Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
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
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input autoComplete="street-address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <Separator />

        {/* Education */}
        <section className="space-y-4">
          <h2 className="font-heading text-base font-bold">Education</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <FormControl>
                    <Input placeholder="BSc Electrical Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks / CGPA</FormLabel>
                  <FormControl>
                    <Input placeholder="3.4 / 4.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="field"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field</FormLabel>
                <FormControl>
                  <Input placeholder="Power electronics" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="institute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institute</FormLabel>
                <FormControl>
                  <Input placeholder="UET Lahore" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        {/* Experience */}
        <section className="space-y-4">
          <h2 className="font-heading text-base font-bold">Experience</h2>
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Add Experience</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Roles, companies, dates and what you worked on."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        {/* Resume */}
        <section className="space-y-3">
          <h2 className="font-heading text-base font-bold">Add Resume</h2>
          <Label htmlFor="resume">Upload Resume</Label>

          <label
            htmlFor="resume"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input px-6 py-10 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/50"
          >
            {resume ? (
              <>
                <FileCheck2 className="size-7 text-leaf-600" aria-hidden />
                <span className="text-sm font-semibold">{resume.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(resume.size / 1024).toFixed(0)} KB — click to replace
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="size-7 text-muted-foreground" aria-hidden />
                <span className="text-sm font-semibold">Click to upload</span>
                <span className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX (Max 1 MB)
                </span>
              </>
            )}
          </label>

          <input
            ref={inputRef}
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          {resume ? (
            <button
              type="button"
              onClick={() => {
                handleFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="size-3" aria-hidden />
              Remove attachment
            </button>
          ) : null}

          {resumeError ? (
            <p className="text-sm text-destructive">{resumeError}</p>
          ) : null}
        </section>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full bg-cta-400 font-bold text-cta-foreground hover:bg-cta-500"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            "Apply Now"
          )}
        </Button>
      </form>
    </Form>
  );
}
