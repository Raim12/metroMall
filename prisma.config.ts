import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration.
 *
 * The connection URL lives here (for migrate/seed/studio) rather than in
 * schema.prisma, which no longer accepts `url`. The runtime client gets its
 * connection through a driver adapter — see src/lib/prisma.ts.
 *
 * `DATABASE_URL` is deliberately NOT required here. `prisma generate` runs in
 * `postinstall` and only needs the schema — but it loads this file first, so
 * demanding the variable made the client fail to generate during a build on any
 * host that supplies env vars at runtime only. The build then failed later and
 * confusingly, with "Can't resolve '@/generated/prisma/client'".
 *
 * Commands that actually touch the database (`migrate`, `seed`, `studio`) still
 * need a real URL; the placeholder below cannot connect, so they fail loudly
 * with a connection error rather than silently doing the wrong thing.
 */
const UNSET = "postgresql://unset:unset@localhost:5432/unset?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? UNSET,
  },
});
