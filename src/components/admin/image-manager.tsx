"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  deleteProductImageAction,
  makePrimaryImage,
  uploadProductImage,
} from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

const MAX_MB = 4;

export function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: string[];
}) {
  const [pending, startTransition] = React.useTransition();
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function upload(file: File) {
    // Cheap client-side guard so an obviously-too-big file never uploads.
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_MB} MB.`,
      );
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("image", file);

      const result = await uploadProductImage(formData);
      if (result.ok) toast.success(result.message ?? "Image uploaded.");
      else toast.error(result.error);

      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function run(
    action: (fd: FormData) => Promise<{ ok: boolean; message?: string; error?: string }>,
    url: string,
  ) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("url", url);

      const result = await action(formData);
      if (result.ok) toast.success(result.message ?? "Done.");
      else toast.error(result.error ?? "Something went wrong.");
    });
  }

  return (
    <Card className="gap-4 p-6">
      <div>
        <h2 className="font-heading text-base font-bold">Photos</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The first photo is what the shop shows. With no photos, the generated
          illustration is used instead.
        </p>
      </div>

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, i) => (
            <li
              key={url}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-muted",
                i === 0 && "ring-2 ring-brand-500",
              )}
            >
              <div className="aspect-square">
                <Image
                  src={url}
                  alt={`Product photo ${i + 1}`}
                  width={300}
                  height={300}
                  className="size-full object-cover"
                />
              </div>

              {i === 0 ? (
                <span className="absolute left-2 top-2 rounded bg-brand-600 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                  Primary
                </span>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                {i !== 0 ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(makePrimaryImage, url)}
                    className="grid size-7 place-items-center rounded bg-white/90 text-ink-900 transition-colors hover:bg-white"
                    aria-label="Make primary photo"
                    title="Make primary"
                  >
                    <Star className="size-3.5" aria-hidden />
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(deleteProductImageAction, url)}
                  className="ml-auto grid size-7 place-items-center rounded bg-white/90 text-destructive transition-colors hover:bg-white"
                  aria-label="Delete photo"
                  title="Delete"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-input hover:border-brand-400 hover:bg-brand-50/50",
          pending && "pointer-events-none opacity-60",
        )}
      >
        {pending ? (
          <Loader2 className="size-6 animate-spin text-brand-600" aria-hidden />
        ) : images.length > 0 ? (
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
        ) : (
          <UploadCloud className="size-6 text-muted-foreground" aria-hidden />
        )}
        <span className="text-sm font-semibold">
          {pending ? "Uploading..." : "Click or drop an image"}
        </span>
        <span className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or AVIF · max {MAX_MB} MB
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          disabled={pending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </label>

      {images.length === 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="self-start"
        >
          Choose a file
        </Button>
      ) : null}
    </Card>
  );
}
