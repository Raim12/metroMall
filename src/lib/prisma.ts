import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma client singleton.
 *
 * Prisma 7 connects through a driver adapter rather than a `url` in the schema.
 * In dev, Next's hot reload re-evaluates modules on every change, so the client
 * is cached on `globalThis` to avoid exhausting the connection pool.
 *
 * Construction is lazy, behind a Proxy. `next build` imports every route module
 * to collect page data, so building eagerly here meant a missing DATABASE_URL
 * failed the whole build — even for routes that never touch the database. Now
 * only code that actually issues a query pays that cost, and the error names
 * the real problem.
 */

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Locally: copy .env.example to .env. On a host: set it in the service's environment (it must be available at build time too, because pages are prerendered).",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function client(): PrismaClient {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}

/**
 * Behaves exactly like a PrismaClient, but defers construction until the first
 * property access — i.e. until something really queries.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(client(), property, receiver);
  },
  has(_target, property) {
    return Reflect.has(client(), property);
  },
  ownKeys() {
    return Reflect.ownKeys(client());
  },
  getOwnPropertyDescriptor(_target, property) {
    return Reflect.getOwnPropertyDescriptor(client(), property);
  },
});
