import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="metro-wash">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
        <p className="font-heading text-6xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 font-heading text-2xl font-extrabold sm:text-3xl">
          This page blew away
        </h1>
        <p className="mt-3 text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-brand-600 hover:bg-brand-700">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/catalogue">Browse fans</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
