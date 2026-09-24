import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to products
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-extrabold">Add product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Photos can be uploaded once the product is created.
        </p>
      </div>

      <div className="max-w-3xl">
        <ProductForm />
      </div>
    </div>
  );
}
